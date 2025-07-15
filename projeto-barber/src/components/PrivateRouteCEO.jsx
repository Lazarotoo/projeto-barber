import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRouteCEO({ children }) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario || usuario.role !== "ceo") {
    alert("Acesso negado! Você precisa estar logado como CEO.");
    return <Navigate to="/login" replace />;
  }
  return children;
}
