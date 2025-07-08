// 📄 AgendaCliente.jsx corrigido

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarioBarber from './CalendarioBarber';
import './AgendaCliente.css';

import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AgendaCliente = () => {
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState([]);
  const [alterandoIndex, setAlterandoIndex] = useState(null);
  const [novaData, setNovaData] = useState(null);
  const [novoHorario, setNovoHorario] = useState(null);

  const clienteLogado = JSON.parse(localStorage.getItem('clienteLogado')) || {};
  const clienteUid = clienteLogado.uid;

  useEffect(() => {
    if (!clienteUid) return;

    const q = query(collection(db, 'agendamentos'), where('clienteUid', '==', clienteUid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const agendamentosData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.validado) {
          agendamentosData.push({ id: doc.id, ...data });
        }
      });
      setAgendamentos(agendamentosData);
    });

    return () => unsubscribe();
  }, [clienteUid]);

  const handleCancelar = async (id) => {
    if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    try {
      await deleteDoc(doc(db, 'agendamentos', id));
      alert('Agendamento cancelado com sucesso!');
    } catch (error) {
      alert('Erro ao cancelar agendamento: ' + error.message);
    }
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

  const handleSalvarAlteracao = async () => {
    if (novaData && novoHorario && alterandoIndex !== null) {
      const agendamento = agendamentos[alterandoIndex];
      try {
        await updateDoc(doc(db, 'agendamentos', agendamento.id), {
          data: novaData,
          hora: novoHorario,
        });
        alert('Agendamento alterado com sucesso!');
        setAlterandoIndex(null);
        setNovaData(null);
        setNovoHorario(null);
      } catch (error) {
        alert('Erro ao alterar agendamento: ' + error.message);
      }
    } else {
      alert("Selecione uma nova data e horário.");
    }
  };

  return (
    <div className="agenda-container">
      <header className="agenda-header">
        <button className="agenda-back" onClick={() => navigate(-1)} aria-label="Voltar">←</button>
        <h1 className="agenda-title">Seus Agendamentos</h1>
      </header>

      <main className="agenda-main">
        {agendamentos.length === 0 ? (
          <div className="agenda-empty">
            <h2>Nenhum agendamento encontrado.</h2>
            <button className="agenda-btn" onClick={() => navigate('/select-barber', { state: { name: 'RBI IGUAÇU' } })}>
              Agendar agora
            </button>
          </div>
        ) : (
          agendamentos.map((item, index) => (
            <div key={item.id} className="agenda-card">
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
                <button className="agenda-btn" onClick={() => handleCancelar(item.id)}>Cancelar</button>
                <button className="agenda-btn" onClick={() => handleAlterar(index)}>Alterar</button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default AgendaCliente;
