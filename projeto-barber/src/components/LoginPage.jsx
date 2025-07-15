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

  useEffect(() => {
    // Limpa qualquer usuário logado anteriormente (pode comentar se preferir)
    localStorage.removeItem("usuarioLogado");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro(null);

    try {
      // 1. Autentica o usuário no Firebase Auth
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      // 2. Busca os dados do usuário na coleção "usuarios"
      const userDoc = await getDoc(doc(db, "usuarios", uid));
      if (!userDoc.exists()) {
        setErro("Usuário não cadastrado no sistema.");
        return;
      }

      // 3. Garante que role está limpo e formatado corretamente
      const dados = userDoc.data();
      const role = dados.role?.trim().toLowerCase();

      // 4. Monta o objeto completo e salva no localStorage
      const usuarioLogado = {
        uid,
        email: dados.email,
        role: role,
      };

      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
      console.log("Dados salvos no localStorage:", localStorage.getItem("usuarioLogado"));

      // 5. Redireciona conforme o tipo de usuário
      if (role === "barbeiro") {
        navigate("/barbeiros");
      } else if (role === "ceo") {
        navigate("/ceo");
      } else if (role === "cliente") {
        navigate("/inicio");
      } else {
        setErro("Tipo de usuário inválido.");
      }
    } catch (error) {
      setErro("Erro no login: " + error.message);
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

        {erro && (
          <p style={{ color: "red", marginBottom: "1rem" }}>{erro}</p>
        )}

        <div className="button-container">
          <button type="submit" className="btn-login">
            <span className="btn-text">Entrar</span>
          </button>
        </div>
      </form>

      <p
        className="forgot-password"
        onClick={handleForgotPassword}
        style={{ cursor: "pointer" }}
      >
        Esqueci minha senha
      </p>

      <p
        className="register-link"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        Não possui conta? Cadastre-se aqui
      </p>
    </div>
  );
}
