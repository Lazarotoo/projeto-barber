import React, { useEffect, useState } from 'react';
import './Perfil.css';
import { useNavigate } from 'react-router-dom';
import { doc,  updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const Perfil = () => {
  const navigate = useNavigate();
  const [pontos, setPontos] = useState(0);
  const pontosParaCorteGratis = 100;

  useEffect(() => {
    const clienteLogado = JSON.parse(localStorage.getItem('clienteLogado'));
    if (!clienteLogado || !clienteLogado.uid) {
      navigate('/login');
      return;
    }

    const clienteRef = doc(db, "clientes", clienteLogado.uid);

    // Atualiza pontos em tempo real se mudar no Firestore
    const unsubscribe = onSnapshot(clienteRef, (docSnap) => {
      if (docSnap.exists()) {
        setPontos(docSnap.data().pontos || 0);
      } else {
        setPontos(0);
      }
    }, (error) => {
      console.error("Erro ao escutar pontos:", error);
    });

    return () => unsubscribe();
  }, [navigate]);

  const pontosFaltando = Math.max(pontosParaCorteGratis - pontos, 0);

  const handleResgatar = async () => {
    if (pontos >= pontosParaCorteGratis) {
      const clienteLogado = JSON.parse(localStorage.getItem('clienteLogado'));
      const clienteRef = doc(db, "clientes", clienteLogado.uid);
      const novosPontos = pontos - pontosParaCorteGratis;

      try {
        await updateDoc(clienteRef, { pontos: novosPontos });
        alert('Parabéns! Você resgatou um corte grátis!');
        setPontos(novosPontos);
      } catch (error) {
        alert("Erro ao atualizar pontos: " + error.message);
      }
    }
  };

  return (
    <div className="perfil-container">
      <header className="perfil-header">
        <button
          className="perfil-back"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
        >
          ←
        </button>
        <h1 className="perfil-title">Perfil do Cliente</h1>
      </header>

      <main className="perfil-main">
        <div className="pontos-display">
          <h2>Pontos acumulados</h2>
          <p className="pontos-num">{pontos}</p>
          <p>
            Faltam <strong>{pontosFaltando}</strong> pontos para ganhar um corte
            grátis
          </p>
        </div>
      </main>

      <footer className="resgatar-container">
        <button
          className="resgatar-btn"
          onClick={handleResgatar}
          disabled={pontos < pontosParaCorteGratis}
          aria-disabled={pontos < pontosParaCorteGratis}
        >
          Resgatar corte grátis
        </button>
      </footer>
    </div>
  );
};

export default Perfil;
