import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function HostInput() {
  const [host, setHost] = useState("");
  const [message, setMessage] = useState("");
  const [models, setModels] = useState<string[]>([]);

  const testHost = async () => {
    try {
      const response = await invoke<OllamaResponse>("fetch_ollama_models", { host });
      setModels(response.models.map((m) => m.name));
      setMessage("Host válido!");
    } catch (error) {
      setMessage(`Erro: ${error}`);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await invoke<{ models: { name: string }[] }>("fetch_ollama_models", { host });
      setModels(response.models.map((model) => model.name));
    } catch (error) {
      setMessage("Erro ao buscar modelos do Ollama. Error: " + error);
    }
  };

  return (
    <div className="container">
      <h2>Configurar Host</h2>
      <input
        type="text"
        className="input-box"
        placeholder="Digite o host do servidor"
        value={host}
        onChange={(e) => setHost(e.target.value)}
      />
      <button onClick={testHost}>Testar Host</button>
      <p>{message}</p>
      <h3>Modelos Disponíveis:</h3>
      <ul>
        {models.map((model) => (
          <li key={model}>{model}</li>
        ))}
      </ul>
    </div>
  );
}
