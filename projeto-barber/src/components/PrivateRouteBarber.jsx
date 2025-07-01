import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRouteBarber({ children }) {
  const usuarioTipo = localStorage.getItem("usuarioTipo");
  
  if (usuarioTipo !== "barbeiro") {
    // Se não for barbeiro, redireciona para o login normal
    return <Navigate to="/login" replace />;
  }

  // Se for barbeiro, renderiza o componente protegido
  return children;
}
