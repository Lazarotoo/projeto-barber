// src/components/LogoutButton.jsx
import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // ajuste caminho se necessário
import { useNavigate } from "react-router-dom";
import "./LogoutButton.css"; // import do CSS

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("clienteLogado");
      navigate("/login");
    } catch (error) {
      alert("Erro ao sair: " + error.message);
    }
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Sair
    </button>
  );
}
