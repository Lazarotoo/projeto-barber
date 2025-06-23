import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarioBarber from './CalendarioBarber';
import './AgendaCliente.css';

const AgendaCliente = () => {
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState([]);
  const [alterandoIndex, setAlterandoIndex] = useState(null);
  const [novaData, setNovaData] = useState(null);
  const [novoHorario, setNovoHorario] = useState(null);

  // 🔄 Recarrega os dados do localStorage sempre que o componente for montado
  useEffect(() => {
    const dadosSalvos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    setAgendamentos(dadosSalvos);
  }, []);

  const handleCancelar = (index) => {
    const novos = [...agendamentos];
    novos.splice(index, 1);
    localStorage.setItem('agendamentos', JSON.stringify(novos));
    setAgendamentos(novos);
  };

  const handleAlterar = (index) => {
    setAlterandoIndex(index);
    setNovaData(null);
    setNovoHorario(null);
  };

  const handleDateSelect = (date) => {
    setNovaData(date.toLocaleDateString());
  };

  const handleTimeSelect = (time) => {
    setNovoHorario(time);
  };

  const handleSalvarAlteracao = () => {
    if (novaData && novoHorario && alterandoIndex !== null) {
      const atualizados = [...agendamentos];
      atualizados[alterandoIndex].data = novaData;
      atualizados[alterandoIndex].hora = novoHorario;
      localStorage.setItem('agendamentos', JSON.stringify(atualizados));
      setAgendamentos(atualizados);
      setAlterandoIndex(null);
      setNovaData(null);
      setNovoHorario(null);
    } else {
      alert("Selecione uma nova data e horário.");
    }
  };

  if (agendamentos.length === 0) {
  return (
    <div className="agenda-container">
      <h2 className="agenda-empty">Nenhum agendamento encontrado.</h2>
      <button className="agenda-btn" onClick={() => navigate('/select-barber')}>
        Agendar agora
      </button>
    </div>
  );
}

  return (
    <div className="agenda-container">
      <header className="agenda-header">
        <button className="agenda-back" onClick={() => navigate(-1)}>←</button>
        <h1 className="agenda-title">Seus Agendamentos</h1>
      </header>

      <main className="agenda-main">
        {agendamentos.map((item, index) => (
          <div key={index} className="agenda-card">
            <p><strong>Barbeiro:</strong> {item.barbeiro}</p>
            <p><strong>Data:</strong> {item.data}</p>
            <p><strong>Horário:</strong> {item.hora}</p>

            {alterandoIndex === index && (
              <div style={{ marginTop: '1rem' }}>
                <CalendarioBarber onDateSelect={handleDateSelect} />
                {novaData && (
                  <div className="time-selector">
                    <h4>Horários para {novaData}</h4>
                    <div className="time-buttons">
                      {Array.from({ length: 16 }, (_, i) => {
                        const hour = 7 + i;
                        const time = `${hour.toString().padStart(2, '0')}:00`;
                        return (
                          <button
                            key={time}
                            className={novoHorario === time ? 'selected' : ''}
                            onClick={() => handleTimeSelect(time)}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                    <button className="agenda-btn" onClick={handleSalvarAlteracao} style={{ marginTop: '1rem' }}>
                      Salvar Alterações
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="agenda-actions">
              <button className="agenda-btn" onClick={() => handleCancelar(index)}>Cancelar</button>
              <button className="agenda-btn" onClick={() => handleAlterar(index)}>Alterar</button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default AgendaCliente;
