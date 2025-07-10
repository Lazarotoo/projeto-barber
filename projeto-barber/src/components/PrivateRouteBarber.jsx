import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRouteBarber({ children }) {
  const usuarioTipo = localStorage.getItem("usuarioTipo");
  if (usuarioTipo !== "barbeiro") {
    alert("Acesso negado! Você precisa estar logado como Barbeiro.");
    return <Navigate to="/login" replace />;
  }
  return children;
}
