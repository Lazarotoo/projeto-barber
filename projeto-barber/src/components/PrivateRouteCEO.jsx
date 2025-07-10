import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRouteCEO({ children }) {
  const usuarioTipo = localStorage.getItem("usuarioTipo");
  if (usuarioTipo !== "ceo") {
    alert("Acesso negado! Você precisa estar logado como CEO.");
    return <Navigate to="/login" replace />;
  }
  return children;
}
