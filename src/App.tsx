import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
//import { invoke } from "@tauri-apps/api/core";
import ChatInterface from "./components/ChatInterface";
import ModelSelection from "./components/ModelSelection";
import HostInput from "./components/HostInput";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="container">
        <h1>Talkama AI App</h1>
        <nav className="navbar">
          <Link to="/chat">Chat</Link>
          <Link to="/models">Modelos</Link>
          <Link to="/host">Host</Link>
        </nav>
        <Routes>
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/models" element={<ModelSelection />} />
          <Route path="/host" element={<HostInput />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
