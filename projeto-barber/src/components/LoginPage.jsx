import React from "react";
import "./LoginPage.css";

export default function LoginPage() {
  return (
    <div className="root-container">
      <div>
        <div className="container">
          <div className="container-padding">
            <div className="hero-image"></div>
          </div>
        </div>

        <h2 className="title">
          Bem-Vindo de Volta<br />
          à<br />
          RBI BARBER
        </h2>

        {[
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
          <button className="btn-register">
            <span className="btn-text">Entrar</span>
          </button>
        </div>

        <p className="login-link">
          Ainda não possui conta? Registre-se aqui
        </p>
      </div>

      <div>
        <div className="dark-image"></div>
        <div className="light-image"></div>
      </div>
    </div>
  );
}
