import React from 'react';
import './ServicosBarber.css';

const ServicosBarber = ({ servicos = [], onSelecionar }) => {
  return (
    <div className="servicos-container">
      <h3>Escolha um serviço:</h3>
      <ul>
        {servicos.length === 0 && <li>Nenhum serviço disponível.</li>}
        {servicos.map((servico, index) => (
          <li key={index}>
            <button onClick={() => onSelecionar(servico)}>
              {servico.nome} - R$ {servico.preco.toFixed(2)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServicosBarber;
