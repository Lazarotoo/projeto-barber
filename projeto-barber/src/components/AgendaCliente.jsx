import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarioBarber from './CalendarioBarber';
import './AgendaCliente.css';

import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const AgendaCliente = () => {
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState([]);
  const [alterandoIndex, setAlterandoIndex] = useState(null);
  const [novaData, setNovaData] = useState(null);
  const [novoHorario, setNovoHorario] = useState(null);
  const [horariosOcupadosParaAlteracao, setHorariosOcupadosParaAlteracao] = useState([]);
  const [loadingHorariosAlteracao, setLoadingHorariosAlteracao] = useState(false);

  const clienteLogado = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
  const clienteUid = clienteLogado.uid;

  const fetchBookedTimes = useCallback(async (barberName, date) => {
    if (!barberName || !date) return [];
    setLoadingHorariosAlteracao(true);
    try {
      const q = query(
        collection(db, 'agendamentos'),
        where('barbeiro', '==', barberName),
        where('data', '==', date)
      );
      const querySnapshot = await getDocs(q);
      const bookedTimesList = querySnapshot.docs.map(doc => doc.data().hora);
      return bookedTimesList;
    } catch (error) {
      console.error("Erro ao buscar horários agendados para alteração:", error);
      return [];
    } finally {
      setLoadingHorariosAlteracao(false);
    }
  }, []);

  useEffect(() => {
    if (!clienteUid) return;

    const q = query(collection(db, 'agendamentos'), where('clienteUid', '==', clienteUid), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const agendamentosData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        agendamentosData.push({ id: doc.id, ...data });
      });
      // console.log("Firestore onSnapshot disparou. Agendamentos atuais:", agendamentosData); // Manter este log para depuração, se quiser
      setAgendamentos(agendamentosData);
    });

    return () => unsubscribe();
  }, [clienteUid]);

  useEffect(() => {
    async function getHorariosOcupados() {
      if (alterandoIndex !== null && novaData) {
        const agendamentoAtual = agendamentos[alterandoIndex];
        if (agendamentoAtual && agendamentoAtual.barbeiro && novaData) {
          const times = await fetchBookedTimes(agendamentoAtual.barbeiro, novaData);
          setHorariosOcupadosParaAlteracao(times);
        } else {
          setHorariosOcupadosParaAlteracao([]);
        }
      } else {
        setHorariosOcupadosParaAlteracao([]);
      }
    }
    getHorariosOcupados();
  }, [alterandoIndex, novaData, agendamentos, fetchBookedTimes]);

  const handleCancelar = async (agendamentoId) => {
    console.log("handleCancelar: Tentando cancelar agendamento com ID:", agendamentoId);

    if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      console.log("handleCancelar: Cancelamento abortado pelo usuário.");
      return;
    }

    if (!agendamentoId) {
      console.error("handleCancelar: ID do agendamento é undefined ou nulo. Não é possível cancelar.");
      alert("Erro: ID do agendamento inválido. Não foi possível cancelar.");
      return;
    }

    try {
      await deleteDoc(doc(db, 'agendamentos', agendamentoId));
      console.log("handleCancelar: Agendamento cancelado com sucesso no Firestore. ID:", agendamentoId);
      alert('Agendamento cancelado com sucesso!');

      // --- ALTERAÇÃO AQUI ---
      // Atualiza o estado local imediatamente, removendo o agendamento cancelado
      setAgendamentos(prevAgendamentos => prevAgendamentos.filter(agendamento => agendamento.id !== agendamentoId));
      // --- FIM DA ALTERAÇÃO ---

    } catch (error) {
      console.error("handleCancelar: Erro ao cancelar agendamento:", error);
      alert('Erro ao cancelar agendamento: ' + error.message);
    }
  };


  const handleAlterar = (index) => {
    setAlterandoIndex(index);
    setNovaData(null);
    setNovoHorario(null);
    setHorariosOcupadosParaAlteracao([]);
  };

  const handleDateSelect = (date) => {
    const formattedDate = date.toLocaleDateString('pt-BR');
    setNovaData(formattedDate);
    setNovoHorario(null);
  };

  const generateTimes = () => {
    const times = [];
    for (let hour = 7; hour <= 22; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return times;
  };

  const handleTimeSelect = (time) => {
    const agendamento = agendamentos[alterandoIndex];
    const isCurrentAppointmentTime = (agendamento.data === novaData && agendamento.hora === time);

    if (horariosOcupadosParaAlteracao.includes(time) && !isCurrentAppointmentTime) {
      alert("❗ Este horário já está reservado. Por favor, escolha outro.");
      setNovoHorario(null);
      return;
    }
    setNovoHorario(time);
  };

  const handleSalvarAlteracao = async () => {
    if (novaData && novoHorario && alterandoIndex !== null) {
      const agendamento = agendamentos[alterandoIndex];

      const occupiedTimesAtFinalCheck = await fetchBookedTimes(agendamento.barbeiro, novaData);
      if (occupiedTimesAtFinalCheck.includes(novoHorario) && !(agendamento.data === novaData && agendamento.hora === novoHorario)) {
        alert("❗ Este horário acabou de ser reservado por outro cliente. Por favor, escolha outro.");
        setNovoHorario(null);
        return;
      }

      try {
        await updateDoc(doc(db, 'agendamentos', agendamento.id), {
          data: novaData,
          hora: novoHorario,
        });
        alert('Agendamento alterado com sucesso!');
        setAlterandoIndex(null);
        setNovaData(null);
        setNovoHorario(null);
        setHorariosOcupadosParaAlteracao([]);
      } catch (error) {
        alert('Erro ao alterar agendamento: ' + error.message);
        console.error("Erro ao alterar agendamento:", error);
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
            <button className="agenda-btn" onClick={() => navigate('/inicio')}>
              Agendar agora
            </button>
          </div>
        ) : (
          agendamentos.map((item, index) => (
            <div key={item.id} className="agenda-card">
              <p><strong>Barbearia:</strong> {item.barbearia || 'N/A'}</p>
              <p><strong>Barbeiro:</strong> {item.barbeiro}</p>
              <p><strong>Data:</strong> {item.data}</p>
              <p><strong>Horário:</strong> {item.hora}</p>
              <p><strong>Serviços:</strong></p>
              <ul>
                {item.servicos && item.servicos.length > 0 ? (
                  item.servicos.map((servico, idx) => (
                    <li key={idx}>{servico}</li>
                  ))
                ) : (
                  <li>Nenhum serviço</li>
                )}
              </ul>
              <p><strong>Preço Total:</strong> R$ {item.preco ? item.preco.toFixed(2) : '0.00'}</p>
              <p><strong>Status:</strong> {item.validado ? 'Confirmado' : 'Pendente'}</p>

              {alterandoIndex === index && (
                <div style={{ marginTop: '1rem' }}>
                  <CalendarioBarber onDateSelect={handleDateSelect} />
                  {novaData && (
                    <div className="time-selector">
                      <h4>Horários para {novaData}</h4>
                      {loadingHorariosAlteracao ? (
                        <p>Carregando horários...</p>
                      ) : (
                        <div className="time-buttons">
                          {generateTimes().map(time => {
                            const isBooked = horariosOcupadosParaAlteracao.includes(time);
                            const isCurrentAppointmentTime = (item.data === novaData && item.hora === time);

                            return (
                              <button
                                key={time}
                                className={`${novoHorario === time ? 'selected' : ''} ${isBooked && !isCurrentAppointmentTime ? 'booked-time' : ''}`}
                                onClick={() => handleTimeSelect(time)}
                                disabled={isBooked && !isCurrentAppointmentTime}
                              >
                                {time}
                              </button>
                            );
                          })}
                        </div>
                      )}
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