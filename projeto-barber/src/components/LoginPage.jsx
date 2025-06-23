import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sempre que abrir a página de login, remove clienteLogado para "deslogar"
  useEffect(() => {
    localStorage.removeItem("clienteLogado");
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

    const cliente = clientes.find(
      (c) => c.email === email && c.password === password
    );

    if (!cliente) {
      alert("Email ou senha inválidos.");
      return;
    }

    // Salva cliente como logado
    localStorage.setItem("clienteLogado", JSON.stringify(cliente));
    navigate("/inicio");
  };

  return (
    <div className="root-container">
      <div className="hero-image"></div>
      <h2 className="title">Login<br />RBI BARBER</h2>

      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label className="input-label">
            <input
              type="email"
              placeholder="Email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
        </div>

        <div className="input-group">
          <label className="input-label">
            <input
              type="password"
              placeholder="Senha"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>

        <div className="button-container">
          <button type="submit" className="btn-login">
            <span className="btn-text">Entrar</span>
          </button>
        </div>
      </form>

      <p
        className="register-link"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer", textDecoration: "underline" }}
      >
        Não possui conta? Cadastre-se aqui
      </p>
    </div>
  );
}
