import React, { useState, useEffect, useCallback } from 'react';
import './SelectBarber.css';
import CalendarioBarber from './CalendarioBarber';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function SelectBarber() {
  const navigate = useNavigate();
  const location = useLocation();
  const barbershop = location.state;

  const [selectedBarberIndex, setSelectedBarberIndex] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  // Removido: const [loadingTimes, setLoadingTimes] = useState(false);
  const [currentBookedTimes, setCurrentBookedTimes] = useState([]);

  const servicosBase = [
    { nome: 'Corte (Equipe)', preco: 35 },
    { nome: 'Sobrancelha', preco: 15 },
    { nome: 'Barba Terapia', preco: 35 },
    { nome: 'Botox', preco: 80 },
    { nome: 'Limpeza Facial', preco: 30 },
    { nome: 'Mechas Platinada', preco: 80 },
    { nome: 'Hidratação de Cabelo com Máscara (Térmica)', preco: 45 },
    { nome: 'Pintura Global Cabelo (Cores a Escolher)', preco: 60 },
    { nome: 'Pigmentação de Barba', preco: 20 },
  ];

  const generateCombos = (services) => {
    let combos = [];
    for (let i = 0; i < services.length; i++) {
      for (let j = i + 1; j < services.length; j++) {
        if (services[i].nome !== services[j].nome) {
          const nome = `${services[i].nome} + ${services[j].nome}`;
          const preco = services[i].preco + services[j].preco - 5;
          combos.push({ nome, preco });
        }
      }
    }
    return combos;
  };

  const servicos = [...servicosBase, ...generateCombos(servicosBase)];

  const barbers = (barbershop?.name === 'RBI IGUAÇU') ? [
    { name: 'Gil', img: '/images/foto-gil-projeto.png' },
    { name: 'Lucas', img: 'https://randomuser.me/api/portraits/men/62.jpg' },
    { name: 'Douglas', img: 'https://randomuser.me/api/portraits/men/42.jpg' },
    { name: 'André', img: 'https://randomuser.me/api/portraits/men/52.jpg' },
  ] : (barbershop?.name === 'Barbearia Central') ? [
    { name: 'Mikael', img: '/images/FOTO-MIKAEL.jpeg'},
    { name: 'Ana', img: '/images/FOTO-ANA.jpeg'},
    { name: 'Vitor Eduardo', img: '/images/FOTO-VICTOR.jpeg'},
  ] : [];

  // Função para buscar agendamentos para um barbeiro e data específicos
  const fetchBookedTimes = useCallback(async (barberName, date) => {
    if (!barberName || !date) return [];
    // Removido: setLoadingTimes(true);
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
      console.error("Erro ao buscar horários agendados:", error);
      return [];
    }
    // Removido: finally { setLoadingTimes(false); }
  }, []);

  // useEffect para carregar horários ocupados sempre que o barbeiro ou a data mudarem
  const currentSelectedBarber = selectedBarberIndex !== null ? barbers[selectedBarberIndex] : null;
  useEffect(() => {
    async function getBookedTimesAndUpdateState() {
      if (currentSelectedBarber && selectedDate) {
        // Define o estado de carregamento ANTES de começar a buscar os dados.
        // Isso pode não ser visível na UI se for rápido, mas é importante para a lógica interna.
        // Removido: setLoadingTimes(true); // Se você não tem UI para isso, não precisa setar
        const times = await fetchBookedTimes(currentSelectedBarber.name, selectedDate);
        setCurrentBookedTimes(times);
        // Removido: setLoadingTimes(false); // Se você não tem UI para isso, não precisa setar
      } else {
        setCurrentBookedTimes([]);
      }
    }
    getBookedTimesAndUpdateState();
  }, [currentSelectedBarber, selectedDate, fetchBookedTimes]);

  const generateTimes = () => {
    const times = [];
    for (let hour = 7; hour <= 22; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return times;
  };

  // --- FUNÇÕES DE MANIPULAÇÃO DE ESTADO ---

  const handleBarberSelect = (index) => {
    if (selectedBarberIndex === index) {
      setSelectedBarberIndex(null);
    } else {
      setSelectedBarberIndex(index);
    }
    setSelectedDate(null);
    setSelectedServices([]);
    setSelectedTime(null);
    setShowSummary(false);
  };

  const handleDateSelect = (date) => {
    const formattedDate = date.toLocaleDateString('pt-BR');
    setSelectedDate(formattedDate);
    setSelectedServices([]);
    setSelectedTime(null);
    setShowSummary(false);
    // A busca de horários ocupados agora é totalmente gerenciada pelo useEffect
    // que observa `currentSelectedBarber` e `selectedDate`.
  };

  const toggleService = (servico) => {
    setSelectedServices(prevServices => {
      const isSelected = prevServices.some(s => s.nome === servico.nome);
      let newServices;
      if (isSelected) {
        newServices = prevServices.filter(s => s.nome !== servico.nome);
      } else {
        newServices = [...prevServices, servico];
      }

      if (newServices.length === 0 || (showSummary && newServices.length === prevServices.length - 1 && isSelected)) {
        setSelectedTime(null);
        setShowSummary(false);
      } else if (selectedTime) {
        setShowSummary(true);
      } else {
        setShowSummary(false);
      }
      return newServices;
    });
  };

  const handleTimeSelect = async (time) => {
    const currentBarber = barbers[selectedBarberIndex];
    if (!currentBarber || !selectedDate) {
      alert("Por favor, selecione o barbeiro e a data primeiro.");
      return;
    }

    // A validação agora usa currentBookedTimes, que é atualizado pelo useEffect
    // imediatamente após a mudança de data/barbeiro.
    if (currentBookedTimes.includes(time)) {
        alert("❗ Este horário já está reservado. Por favor, escolha outro.");
        setSelectedTime(null);
        setShowSummary(false);
        return;
    }

    setSelectedTime(time);
    if (selectedServices.length > 0) {
      setShowSummary(true);
    }
  };

  // --- FUNÇÃO PARA AGENDAR ---
  const handleAgendar = async () => {
    const selectedBarber = barbers[selectedBarberIndex];

    if (!selectedBarber || !selectedDate || !selectedTime || selectedServices.length === 0) {
      alert("❗ Por favor, selecione o barbeiro, data, horário e pelo menos um serviço.");
      return;
    }

    // Última verificação de conflito para garantir a atomicidade
    const occupiedTimesAtFinalCheck = await fetchBookedTimes(selectedBarber.name, selectedDate);
    if (occupiedTimesAtFinalCheck.includes(selectedTime)) {
        alert("❗ Este horário acabou de ser reservado por outro cliente. Por favor, escolha outro.");
        setSelectedTime(null);
        setShowSummary(false);
        return;
    }

    try {
      const clienteLogado = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
      const total = selectedServices.reduce((sum, s) => sum + s.preco, 0);

      const agendamento = {
        barbearia: barbershop?.name || 'Indefinida',
        barbeiro: selectedBarber.name,
        data: selectedDate,
        hora: selectedTime,
        servicos: selectedServices.map(s => s.nome),
        preco: total,
        clienteEmail: clienteLogado.email || null,
        clienteUid: clienteLogado.uid || null,
        validado: false,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'agendamentos'), agendamento);
      alert(`✅ Agendado com ${selectedBarber.name} para ${selectedServices.map(s => s.nome).join(', ')}!`);
      navigate('/agenda');

    } catch (error) {
      alert('Erro ao agendar: ' + error.message);
      console.error("Erro ao agendar:", error);
    }
  };

  // --- NAVEGAÇÃO ---
  const handleBack = () => navigate(-1);
  const handleNavigateHome = () => navigate('/inicio');
  const handleNavigateAgenda = () => navigate('/agenda');
  const handleNavigatePerfil = () => navigate('/perfil');

  return (
    <div className="selectbarber-container">
      <header className="selectbarber-header">
        <button className="selectbarber-icon" onClick={handleBack}>←</button>
        <h1 className="selectbarber-title">Selecione o Barbeiro</h1>
      </header>

      <main>
        <h2 className="selectbarber-subtitle">Barbearia: {barbershop?.name}</h2>

        {barbers.map((barber, index) => (
          <section
            className={`barber-card ${selectedBarberIndex === index ? 'selected-barber-active' : ''}`}
            key={index}
          >
            <article className="barber-full-card">
              <button
                className="barber-image-wrapper-large"
                onClick={() => handleBarberSelect(index)}
              >
                <div
                  className="barber-image-background"
                  style={{ backgroundImage: "url('/transparent-background.png')" }}
                />
                <div
                  className="barber-image"
                  style={{ backgroundImage: `url(${barber.img})` }}
                />
              </button>
              <div className="barber-info">
                <button className="barber-name" onClick={() => handleBarberSelect(index)}>
                  {barber.name}
                </button>
              </div>

              {selectedBarberIndex === index && (
                <>
                  {!selectedDate && (
                    <div>
                      <h3>Escolha a data:</h3>
                      <CalendarioBarber
                        onDateSelect={handleDateSelect}
                      />
                    </div>
                  )}

                  {selectedDate && (
                    <div>
                      <h3>Escolha os serviços</h3>
                      <div className="servicos-lista">
                        {servicos.map((servico, i) => (
                          <button
                            key={i}
                            className={`servico-button ${selectedServices.some(s => s.nome === servico.nome) ? 'selected' : ''}`}
                            onClick={() => toggleService(servico)}
                          >
                            {servico.nome} <br /> R$ {servico.preco.toFixed(2)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDate && selectedServices.length > 0 && selectedTime === null && (
                    <div style={{ marginTop: '1rem' }}>
                      <h4>Escolha o horário</h4>
                      {/* Removido: {loadingTimes ? (<p>Verificando horários disponíveis...</p>) : ( */}
                        <div className="time-buttons">
                          {generateTimes().map(time => {
                            const isBooked = currentBookedTimes.includes(time);
                            return (
                              <button
                                key={time}
                                onClick={() => handleTimeSelect(time)}
                                className={`${selectedTime === time ? 'selected-time' : ''} ${isBooked ? 'booked-time' : ''}`}
                                disabled={isBooked}
                              >
                                {time}
                              </button>
                            );
                          })}
                        </div>
                      {/* Removido: )} */}
                    </div>
                  )}

                  {showSummary && selectedServices.length > 0 && selectedTime && (
                    <section className="confirm-section">
                      <h3>Resumo do Agendamento</h3>
                      <p><strong>Barbeiro:</strong> {currentSelectedBarber?.name}</p>
                      <p><strong>Data:</strong> {selectedDate}</p>
                      <p><strong>Hora:</strong> {selectedTime}</p>
                      <ul>
                        {selectedServices.map((s, idx) => (
                          <li key={idx}>{s.nome} - R$ {s.preco.toFixed(2)}</li>
                        ))}
                      </ul>
                      <p><strong>Total: R$ {selectedServices.reduce((sum, s) => sum + s.preco, 0).toFixed(2)}</strong></p>
                      <button className="agendar-btn" onClick={handleAgendar}>Agendar Agora</button>
                    </section>
                  )}
                </>
              )}
            </article>
          </section>
        ))}
      </main>

      <nav className="footer-menu">
        <button onClick={handleNavigateHome} className="footer-item">
          <div className="footer-icon">🏠</div><p>Início</p>
        </button>
        <button onClick={handleNavigateAgenda} className="footer-item">
          <div className="footer-icon">📅</div><p>Agenda</p>
        </button>
        <button onClick={handleNavigatePerfil} className="footer-item">
          <div className="footer-icon">👤</div><p>Perfil</p>
        </button>
      </nav>

      <div className="footer-space"></div>
    </div>
  );
}