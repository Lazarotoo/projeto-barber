import React, { useEffect, useState } from 'react';
import './Perfil.css';
import { useNavigate } from 'react-router-dom';

const Perfil = () => {
  const navigate = useNavigate();
  const [pontos, setPontos] = useState(0);
  const pontosParaCorteGratis = 100;

  useEffect(() => {
    const carregarPontos = () => {
      const clienteLogado = JSON.parse(localStorage.getItem('clienteLogado'));
      if (!clienteLogado || !clienteLogado.uid) {
        navigate('/login');
        return;
      }
      const clientes = JSON.parse(localStorage.getItem('clientes')) || {};
      const pontosSalvos = clientes[clienteLogado.uid]?.pontos || 0;
      setPontos(pontosSalvos);
    };

    carregarPontos();

    const handleStorageChange = (event) => {
      if (event.key === 'clientes') {
        carregarPontos();
      }
    };

    const handlePontosAtualizados = () => {
      carregarPontos();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('pontosAtualizados', handlePontosAtualizados);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('pontosAtualizados', handlePontosAtualizados);
    };
  }, [navigate]);

  const pontosFaltando = Math.max(pontosParaCorteGratis - pontos, 0);

  const handleResgatar = () => {
    if (pontos >= pontosParaCorteGratis) {
      alert('Parabéns! Você resgatou um corte grátis!');
      const clienteLogado = JSON.parse(localStorage.getItem('clienteLogado'));
      const clientes = JSON.parse(localStorage.getItem('clientes')) || {};

      clientes[clienteLogado.uid].pontos = pontos - pontosParaCorteGratis;
      localStorage.setItem('clientes', JSON.stringify(clientes));
      setPontos(pontos - pontosParaCorteGratis);
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
