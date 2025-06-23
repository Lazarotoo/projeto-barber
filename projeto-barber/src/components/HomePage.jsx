import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const logado = localStorage.getItem("clienteLogado");
    if (logado) navigate("/inicio");
  }, [navigate]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegisterClick = () => {
    if (!name || !phone || !email || !password) {
      alert("Preencha todos os campos");
      return;
    }

    const novosDados = { name, phone, email, password };
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const jaExiste = clientes.some((c) => c.email === email);
    if (jaExiste) {
      alert("Já existe um cliente com este e-mail.");
      return;
    }

    clientes.push(novosDados);
    localStorage.setItem("clientes", JSON.stringify(clientes));
    localStorage.setItem("clienteLogado", JSON.stringify(novosDados));
    navigate("/inicio");
  };

  return (
    <div className="root-container">
      {/* Bloco da imagem que estava faltando */}
      <div>
        <div className="container">
          <div className="container-padding">
            <div className="hero-image"></div>
          </div>
        </div>
      </div>

      <h2 className="title">Bem-Vindo<br />a<br />RBI BARBER</h2>

      <div className="input-group">
        <label className="input-label">
          <input
            placeholder="Nome Completo"
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
      </div>

      <div className="input-group">
        <label className="input-label">
          <input
            placeholder="(DDD) + Número"
            className="input-field"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
      </div>

      <div className="input-group">
        <label className="input-label">
          <input
            placeholder="Email"
            className="input-field"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
      </div>

      <div className="input-group">
        <label className="input-label">
          <input
            placeholder="Senha"
            className="input-field"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
      </div>

      <div className="button-container">
        <button className="btn-register" onClick={handleRegisterClick}>
          <span className="btn-text">Registrar</span>
        </button>
      </div>

      <p
        className="login-link"
        onClick={() => navigate("/login")}
        style={{ cursor: "pointer", textDecoration: "underline" }}
      >
        Já possui conta? Clique aqui para login
      </p>
    </div>
  );
}
