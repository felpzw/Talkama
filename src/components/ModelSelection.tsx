import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import React from 'react'

export default function ModelSelection() {
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("");

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await invoke<{ models: { name: string }[] }>("fetch_ollama_models");
        setModels(response.models.map((model) => model.name));
      } catch (error) {
        console.error("Erro ao buscar modelos:", error);
      }
    }
    fetchModels();
  }, []);

  const handleModelSelection = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value;
    setSelectedModel(model);
    try {
      await invoke("set_selected_model", { model });
      console.log(`Modelo definido como: ${model}`);
    } catch (error) {
      console.error("Erro ao definir modelo:", error);
    }
  };

  return (
    <div className="container">
      <h2>Selecionar Modelo</h2>
      <select className="input-box" value={selectedModel} onChange={handleModelSelection}>
        <option value="" className="options">Escolha um modelo</option>
        {models.map((model) => (
          <option key={model} value={model}>{model}</option>
        ))}
      </select>
      <p>Modelo selecionado: {selectedModel || "Nenhum"}</p>
    </div>
  );
}
