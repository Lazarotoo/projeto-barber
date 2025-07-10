import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState(null);

  useEffect(() => {
    localStorage.removeItem("clienteLogado");
    localStorage.removeItem("usuarioTipo");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro(null);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const q = query(collection(db, "usuarios"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setErro("Usuário não cadastrado no sistema.");
        return;
      }

      const dados = querySnapshot.docs[0].data();
      const tipo = dados.role;

      localStorage.setItem("usuarioTipo", tipo);

      if (tipo === "barbeiro") {
        navigate("/barbeiros");
      } else if (tipo === "ceo") {
        navigate("/ceo");
      } else if (tipo === "cliente") {
        localStorage.setItem("clienteLogado", JSON.stringify({ uid: cred.user.uid, ...dados }));
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

        {erro && <p style={{ color: "red", marginBottom: "1rem" }}>{erro}</p>}

        <div className="button-container">
          <button type="submit" className="btn-login">
            <span className="btn-text">Entrar</span>
          </button>
        </div>
      </form>

      <p className="forgot-password" onClick={handleForgotPassword} style={{ cursor: "pointer" }}>
        Esqueci minha senha
      </p>

      <p className="register-link" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        Não possui conta? Cadastre-se aqui
      </p>
    </div>
  );
}
