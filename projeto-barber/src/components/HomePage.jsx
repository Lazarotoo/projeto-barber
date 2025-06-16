import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();

  // Função para tratar o clique no botão registrar
  const handleRegisterClick = () => {
    // Aqui você pode fazer validação, requisição, etc
    // Por enquanto só redireciona para /inicio
    navigate("/inicio");
  };

  return (
    <div className="root-container">
      <div>
        <div className="container">
          <div className="container-padding">
            <div className="hero-image"></div>
          </div>
        </div>

        <h2 className="title">
          Bem-Vindo
          <br />
          a
          <br />
          RBI BARBER
        </h2>

        {[
          { placeholder: "Nome Completo" },
          { placeholder: "(DDD) + Número" },
          { placeholder: "Email" },
          { placeholder: "Senha", type: "password" },
        ].map(({ placeholder, type }, i) => (
          <div key={i} className="input-group">
            <label className="input-label">
              <input
                placeholder={placeholder}
                className="input-field"
                value=""
                onChange={() => {}}
                type={type || "text"}
              />
            </label>
          </div>
        ))}

        <div className="button-container">
          <button className="btn-register" onClick={handleRegisterClick}>
            <span className="btn-text">Registrar</span>
          </button>
        </div>

        <p
          className="login-link"
          onClick={() => navigate("/login")} // redireciona para login
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Já possui conta? Clique aqui para login
        </p>
      </div>

      <div>
        <div className="dark-image"></div>
        <div className="light-image"></div>
      </div>
    </div>
  );
}
