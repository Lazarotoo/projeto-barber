import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; // Ajuste o caminho se necessário
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegisterClick = async () => {
    if (!name || !phone || !email || !password) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      // 1. Cria o usuário no Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      // 2. Salva os dados adicionais no Firestore
      await setDoc(doc(db, "clientes", uid), {
        nome: name,
        telefone: phone,
        email: email
      });

      // 3. Salva os dados no localStorage
      const dadosCliente = {
        uid,
        nome: name,
        telefone: phone,
        email: email
      };
      localStorage.setItem("clienteLogado", JSON.stringify(dadosCliente));

      // 4. Redireciona para a tela inicial
      navigate("/inicio");

    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert("Já existe um cliente com este e-mail.");
      } else {
        alert("Erro ao registrar: " + error.message);
      }
    }
  };

  return (
    <div className="root-container">
      <div className="hero-image"></div>

      <h2 className="title">Bem-Vindo<br />a<br />RBI BARBER</h2>

      {/* Campos controlados */}
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
