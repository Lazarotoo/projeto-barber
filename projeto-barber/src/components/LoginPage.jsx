// LoginPage.js (versão ajustada)

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
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Manter isso comentado se você não quer limpar o localStorage a cada visita
    // localStorage.removeItem("usuarioLogado");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      const userDoc = await getDoc(doc(db, "usuarios", uid));
      if (!userDoc.exists()) {
        setErro("Usuário não cadastrado no sistema.");
        setLoading(false);
        return;
      }

      const dados = userDoc.data();
      const role = dados.role?.trim().toLowerCase();

      const usuarioLogado = {
        uid,
        email: dados.email,
        role: role,
        nome: dados.nome || '', // Garante que o nome esteja presente, se existir
        // Adicione outros dados importantes que você queira no localStorage
      };

      // Salva o objeto completo com a role
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
      console.log("Dados salvos no localStorage:", localStorage.getItem("usuarioLogado"));

      // Redireciona conforme a role
      if (role === "barbeiro") {
        navigate("/barbeiros"); // Mantém a rota para o PainelBarbeiro
      } else if (role === "ceo") {
        navigate("/ceo");
      } else if (role === "cliente") {
        navigate("/inicio");
      } else {
        setErro("Tipo de usuário inválido.");
      }
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        setErro("E-mail ou senha incorretos. Por favor, tente novamente.");
      } else if (error.code === "auth/user-disabled") {
        setErro("Esta conta foi desativada.");
      } else {
        setErro("Erro no login: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setErro(null);
    if (!email) {
      setErro("Por favor, digite seu e-mail no campo acima para redefinir a senha.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Email de redefinição de senha enviado! Verifique sua caixa de entrada.");
    } catch (error) {
      if (error.code === "auth/missing-email") {
        setErro("Por favor, digite um e-mail válido para redefinição de senha.");
      } else if (error.code === "auth/invalid-email") {
        setErro("O endereço de e-mail fornecido é inválido.");
      } else if (error.code === "auth/user-not-found") {
          setErro("Não há registro de usuário correspondente a este e-mail.");
      } else {
        setErro("Erro ao enviar email de recuperação: " + error.message);
      }
    }
  };

  return (
    <div className="root-container">
      <div className="hero-image"></div>
      <h2 className="title">
        Login
        <br />
        RBI BARBER
      </h2>

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
              disabled={loading}
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
              disabled={loading}
            />
          </label>
        </div>

        {erro && (
          <p style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}>{erro}</p>
        )}

        <div className="button-container">
          <button type="submit" className="btn-login" disabled={loading}>
            <span className="btn-text">
              {loading ? "Entrando..." : "Entrar"}
            </span>
          </button>
        </div>
      </form>

      <p
        className="forgot-password"
        onClick={handleForgotPassword}
        style={{ cursor: "pointer", textAlign: "center", marginTop: "1rem" }}
      >
        Esqueci minha senha
      </p>

      <p
        className="register-link"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer", textAlign: "center", marginTop: "1rem" }}
      >
        Não possui conta? Cadastre-se aqui
      </p>
    </div>
  );
}