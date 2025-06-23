import React, { useEffect, useState } from 'react';
import './Perfil.css';
import { useNavigate } from 'react-router-dom';

const Perfil = () => {
  const navigate = useNavigate();
  const [pontos, setPontos] = useState(0);
  const pontosParaCorteGratis = 100;

  // Carrega os pontos do localStorage ao iniciar
  useEffect(() => {
    const pontosSalvos = parseInt(localStorage.getItem('pontosCliente')) || 0;
    setPontos(pontosSalvos);
  }, []);

  // Calcula quantos pontos faltam para o resgate
  const pontosFaltando = Math.max(pontosParaCorteGratis - pontos, 0);

  // Lógica de resgate de corte grátis
  const handleResgatar = () => {
    if (pontos >= pontosParaCorteGratis) {
      alert('Parabéns! Você resgatou um corte grátis!');
      localStorage.setItem('pontosCliente', pontos - pontosParaCorteGratis);
      setPontos(pontos - pontosParaCorteGratis);
    }
  };

  return (
    <div className="perfil-container">
      {/* Cabeçalho fixo com botão de voltar */}
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

      {/* Conteúdo principal com scroll interno se necessário */}
      <main className="perfil-main">
        <div className="pontos-display">
          <h2>Pontos acumulados</h2>
          <p className="pontos-num">{pontos}</p>
          <p>Faltam <strong>{pontosFaltando}</strong> pontos para ganhar um corte grátis</p>
        </div>
      </main>

      {/* Rodapé fixo com botão de resgate */}
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
