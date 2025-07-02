import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarioBarber from './CalendarioBarber';
import './AgendaCliente.css';

import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // ajuste o caminho se precisar

const AgendaCliente = () => {
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState([]);
  const [alterandoIndex, setAlterandoIndex] = useState(null);
  const [novaData, setNovaData] = useState(null);
  const [novoHorario, setNovoHorario] = useState(null);

  // Pega cliente logado do localStorage (certifique-se que login salva isso)
  const clienteLogado = JSON.parse(localStorage.getItem('clienteLogado')) || {};
  const clienteUid = clienteLogado.uid;

  useEffect(() => {
    if (!clienteUid) return; // Se não tiver cliente logado, não faz nada

    // Query para pegar agendamentos do cliente em tempo real
    const q = query(collection(db, 'agendamentos'), where('clienteUid', '==', clienteUid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const agendamentosData = [];
      querySnapshot.forEach((doc) => {
        agendamentosData.push({ id: doc.id, ...doc.data() });
      });
      setAgendamentos(agendamentosData);
    });

    return () => unsubscribe();
  }, [clienteUid]);

  // Função para cancelar agendamento
  const handleCancelar = async (id) => {
    if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    try {
      await deleteDoc(doc(db, 'agendamentos', id));
      alert('Agendamento cancelado com sucesso!');
    } catch (error) {
      alert('Erro ao cancelar agendamento: ' + error.message);
    }
  };

  // Abre formulário para alterar um agendamento
  const handleAlterar = (index) => {
    setAlterandoIndex(index);
    setNovaData(null);
    setNovoHorario(null);
  };

  // Atualiza estado ao selecionar nova data
  const handleDateSelect = (date) => {
    setNovaData(date.toLocaleDateString());
  };

  // Atualiza estado ao selecionar novo horário
  const handleTimeSelect = (time) => {
    setNovoHorario(time);
  };

  // Salva alteração no Firestore
  const handleSalvarAlteracao = async () => {
    if (novaData && novoHorario && alterandoIndex !== null) {
      const agendamento = agendamentos[alterandoIndex];
      try {
        await updateDoc(doc(db, 'agendamentos', agendamento.id), {
          data: novaData,
          hora: novoHorario,
        });
        alert('Agendamento alterado com sucesso!');
        // Reseta os estados para fechar o formulário de alteração
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

  // Renderiza mensagem e botão para agendar caso não tenha agendamentos
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

  // Renderiza lista de agendamentos
  return (
    <div className="agenda-container">
      <header className="agenda-header">
        <button className="agenda-back" onClick={() => navigate(-1)} aria-label="Voltar">←</button>
        <h1 className="agenda-title">Seus Agendamentos</h1>
      </header>

      <main className="agenda-main">
        {agendamentos.map((item, index) => (
          <div key={item.id} className="agenda-card" role="listitem" aria-label={`Agendamento com ${item.barbeiro} no dia ${item.data} às ${item.hora}`}>
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
                            aria-pressed={novoHorario === time}
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
        ))}
      </main>
    </div>
  );
};

export default AgendaCliente;
