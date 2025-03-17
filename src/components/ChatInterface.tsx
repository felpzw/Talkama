import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { readFile } from "@tauri-apps/plugin-fs";
import { open } from "@tauri-apps/plugin-dialog";

interface Message {
  text: string;
  isUser: boolean;
  image?: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleImage = async () => {
    try {
      const selectedPath = await open({ multiple: false });

      if (!selectedPath || typeof selectedPath !== "string") {
        console.warn("Nenhum arquivo foi selecionado.");
        return;
      }

      const fileData = await readFile(selectedPath);
      const base64Image = Buffer.from(fileData).toString("base64");

      setImage(base64Image);
    } catch (error) {
      console.error("Erro ao carregar imagem:", error);
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !image) || isLoading) return;
    setIsLoading(true);

    try {
      setMessages((prev) => [...prev, { text: input, isUser: true, image }]);
      
      const response = await invoke<string>("send_ollama_request", {
        request: { prompt: input, images: image ? [image] : [] },
      });

      setMessages((prev) => [...prev, { text: response, isUser: false }]);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      setMessages((prev) => [...prev, { text: `Erro: ${String(err)}`, isUser: false }]);
    } finally {
      setIsLoading(false);
      setInput("");
      setImage(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container">
      <h2>Chat</h2>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.isUser ? 'user' : 'ai'}`}>
            {msg.image && (
              <img
                src={`data:image/png;base64,${msg.image}`}
                alt="Conteúdo enviado"
                className="message-image"
                style={{ maxWidth: "200px", borderRadius: "8px" }}
              />
            )}
            <p>{msg.text}</p>
          </div>
        ))}
        {isLoading && (
          <div className="message ai">
            <p>Carregando resposta...</p>
          </div>
        )}
      </div>

      <div
        className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragOver ? '#4CAF50' : '#ccc'}`,
          padding: "20px",
          textAlign: "center",
          margin: "10px 0"
        }}
      >
        {image ? (
          <>
            <img
              src={`data:image/png;base64,${image}`}
              alt="Pré-visualização"
              style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px" }}
            />
            <button
              onClick={() => setImage(null)}
              style={{ marginTop: "10px", padding: "5px 10px" }}
            >
              Remover imagem
            </button>
          </>
        ) : (
          <button onClick={handleImage}>Selecionar Imagem</button>
        )}
      </div>

      <div className="input-group" style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          className="input-box"
          placeholder="Digite sua mensagem..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
          disabled={isLoading}
          style={{ flex: 1, padding: "10px" }}
        />
        <button 
          onClick={sendMessage}
          disabled={isLoading}
          style={{ 
            padding: "10px 20px", 
            backgroundColor: isLoading ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px"
          }}
        >
          {isLoading ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
