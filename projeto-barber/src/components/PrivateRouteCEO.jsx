import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRouteCEO({ children }) {
  const usuarioTipo = localStorage.getItem("usuarioTipo");
  const [alertou, setAlertou] = React.useState(false);

  useEffect(() => {
    if (usuarioTipo !== "ceo" && !alertou) {
      alert("Acesso negado! Você precisa estar logado como CEO.");
      setAlertou(true);
    }
  }, [usuarioTipo, alertou]);

  if (usuarioTipo !== "ceo") {
    return <Navigate to="/login" replace />;
  }
  return children;
}
