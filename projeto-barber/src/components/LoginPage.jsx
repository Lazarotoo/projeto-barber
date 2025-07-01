import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    localStorage.removeItem("clienteLogado");
    localStorage.removeItem("usuarioTipo");
  }, []);

  // Credenciais fixas dos barbeiros (alterar conforme precisar)
  const barbeiroEmail = "barbeiro@barbearia.com";
  const barbeiroSenha = "123456";

  const handleLogin = async (e) => {
    e.preventDefault();

    // Primeiro verifica se é barbeiro:
    if (email === barbeiroEmail && password === barbeiroSenha) {
      localStorage.setItem("usuarioTipo", "barbeiro");
      navigate("/barbeiros"); // redireciona para painel dos barbeiros
      return;
    }

    // Senão, tenta login cliente Firebase
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      const docRef = doc(db, "clientes", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dados = docSnap.data();
        localStorage.setItem("clienteLogado", JSON.stringify({ uid, ...dados }));
        localStorage.setItem("usuarioTipo", "cliente");
        navigate("/inicio");
      } else {
        alert("Dados do usuário não encontrados.");
      }
    } catch (error) {
      alert("Erro no login: " + error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Digite seu e-mail para redefinir a senha.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Email de redefinição de senha enviado!");
    } catch (error) {
      alert("Erro ao enviar email de recuperação: " + error.message);
    }
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

      <p className="forgot-password" onClick={handleForgotPassword}>
        Esqueci minha senha
      </p>

      <p className="register-link" onClick={() => navigate("/")}>
        Não possui conta? Cadastre-se aqui
      </p>
    </div>
  );
}
