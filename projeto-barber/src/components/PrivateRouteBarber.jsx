import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function PrivateRouteBarber({ children }) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  const role = usuario?.role?.trim().toLowerCase();
  const location = useLocation();

  if (role !== "barbeiro") {
    // Para evitar alert repetido, só mostra se veio direto da página de login
    if (location.pathname !== "/login") {
      alert("Acesso negado! Você precisa estar logado como Barbeiro.");
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}
