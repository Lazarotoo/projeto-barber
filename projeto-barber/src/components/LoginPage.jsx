import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();

  // Estados para controlar inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Função exemplo para login (você pode adaptar depois)
  function handleLogin(e) {
    e.preventDefault();
    // Aqui você pode colocar a lógica real de login (API, validação, etc)
    alert(`Tentando logar com: \nEmail: ${email}\nSenha: ${password}`);
  }

  return (
    <div className="root-container">
      <div className="hero-image"></div>
      <h2 className="title">Login<br /> RBI BARBER</h2>

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
