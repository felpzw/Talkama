use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::command;
use tokio::sync::Mutex;
use log::{info, error, debug};
use reqwest::Client;

#[derive(Debug, Serialize, Deserialize)]
struct OllamaModel {
    name: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct OllamaResponse {
    models: Vec<OllamaModel>,
}

#[derive(Serialize, Deserialize)]
struct ChatRequest {
    prompt: String,
    images: Option<Vec<String>>,
}

#[derive(Deserialize)]
struct OllamaGenerateResponse {
    response: String,
}

lazy_static::lazy_static! {
    static ref GLOBAL_HOST: Arc<Mutex<Option<String>>> = Arc::new(Mutex::new(None));
    static ref SELECTED_MODEL: Arc<Mutex<Option<String>>> = Arc::new(Mutex::new(None));
}

#[command]
async fn send_ollama_request(request: ChatRequest) -> Result<String, String> {
    let model = match &*SELECTED_MODEL.lock().await {
        Some(m) => m.clone(),
        None => return Err("Nenhum modelo selecionado".into()),
    };

    let host = match &*GLOBAL_HOST.lock().await {
        Some(h) => h.clone(),
        None => return Err("Host não foi definido".into()),
    };

    let url = format!("{}/api/generate", host);
    let client = Client::new();

    debug!("Request URL: {}", url);
    
    let images = request.images.as_ref().and_then(|imgs| {
        if imgs.is_empty() {
            None
        } else {
            Some(imgs.clone())
        }
    });

    let body = serde_json::json!({
        "model": model,
        "prompt": request.prompt,
        "stream": false,
        "images": images
    });

    let response = client.post(&url)
        .json(&body)
        .send()
        .await
        .map_err(|e| {
            error!("Request error: {}", e);
            e.to_string()
        })?;

    let response_text = response.text().await.map_err(|e| {
        error!("Response error: {}", e);
        e.to_string()
    })?;

    let ollama_response: OllamaGenerateResponse = serde_json::from_str(&response_text)
        .map_err(|e| {
            error!("Parse error: {}", e);
            format!("Erro ao analisar resposta: {}", e)
        })?;

    Ok(ollama_response.response)
}

#[command]
async fn fetch_ollama_models(host: Option<String>) -> Result<OllamaResponse, String> {
    let host = match host {
        Some(h) => h,
        None => {
            let host_guard = GLOBAL_HOST.lock().await;
            match &*host_guard {
                Some(h) => h.clone(),
                None => return Err("Host não foi definido".into()),
            }
        }
    };

    *GLOBAL_HOST.lock().await = Some(host.clone());
    
    let url = format!("{}/api/tags", host);
    let client = Client::new();

    let response = client.get(&url)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    response.json::<OllamaResponse>()
        .await
        .map_err(|e| e.to_string())
}

#[command]
async fn set_selected_model(model: String) -> Result<(), String> {
    *SELECTED_MODEL.lock().await = Some(model);
    Ok(())
}

#[command]
async fn get_selected_model() -> Result<Option<String>, String> {
    Ok(SELECTED_MODEL.lock().await.clone())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            send_ollama_request,
            fetch_ollama_models,
            set_selected_model,
            get_selected_model
        ])
        .setup(|app| {
            env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();
            info!("Aplicação iniciada");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}