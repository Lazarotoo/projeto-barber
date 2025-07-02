import React, { useState, useEffect } from 'react';
import './SelectBarber.css';
import CalendarioBarber from './CalendarioBarber';
import ServicosBarber from './ServicosBarber';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";  // ajuste o caminho se necessário

const SelectBarber = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const barbershop = location.state;

  const [agendamentos, setAgendamentos] = useState([]);

  useEffect(() => {
    const fetchAgendamentos = async () => {
      const clienteLogado = JSON.parse(localStorage.getItem('clienteLogado')) || {};
      if (!clienteLogado.uid) return;

      // Busca agendamentos do usuário para controlar conflitos
      const q = query(collection(db, 'agendamentos'), where('clienteUid', '==', clienteLogado.uid));
      const querySnapshot = await getDocs(q);
      const agendamentosData = [];
      querySnapshot.forEach(doc => {
        agendamentosData.push(doc.data());
      });
      setAgendamentos(agendamentosData);
    };
    fetchAgendamentos();
  }, []);

  useEffect(() => {
    if (!barbershop) {
      navigate('/inicio');
    }
  }, [barbershop, navigate]);

  const getBarbersByBarbershop = (name) => {
    if (name === 'RBI IGUAÇU') {
      return [
        { name: 'Gil', img: '/images/foto-gil-projeto.png' },
        { name: 'Lucas', img: 'https://randomuser.me/api/portraits/men/62.jpg' },
        { name: 'Douglas', img: 'https://randomuser.me/api/portraits/men/42.jpg' },
        { name: 'André', img: 'https://randomuser.me/api/portraits/men/52.jpg' },
      ];
    } else if (name === 'Barbearia Central') {
      return [
        { name: 'Mikael', img: '/images/FOTO-MIKAEL.jpeg'},
        { name: 'Ana', img: '/images/FOTO-ANA.jpeg'},
        { name: 'Vitor Eduardo', img: '/images/FOTO-VICTOR.jpeg'},
      ];
    } else {
      return [];
    }
  };

  const barbers = getBarbersByBarbershop(barbershop?.name);

  const servicos = [
    { nome: 'Corte (Equipe)', preco: 35 },
    { nome: 'Corte + Sobrancelha', preco: 50 },
    { nome: 'Corte + Barba Terapia (Equipe)', preco: 70 },
    { nome: 'Corte + Barba Express (Desenho Máquina de Acabamento)', preco: 60 },
    { nome: 'Corte + Botox', preco: 110 },
    { nome: 'Botox', preco: 80 },
    { nome: 'Corte + Barba + Botox', preco: 145 },
    { nome: 'Corte + Barba + Sobrancelhas', preco: 80 },
    { nome: 'Limpeza Facial', preco: 30 },
    { nome: 'Mechas Platinada', preco: 80 },
    { nome: 'Platinado Global', preco: 140 },
    { nome: 'Pigmentação de Barba', preco: 20 },
    { nome: 'Barba Terapia', preco: 35 },
    { nome: 'Corte + Mechas Platinada', preco: 115 },
    { nome: 'Mechas Loira Natural', preco: 60 },
    { nome: 'Corte + Mechas Loiras Natural', preco: 95 },
    { nome: 'Corte + Barba + Sobrancelhas + Mechas Platinada', preco: 165 },
    { nome: 'Corte + Sobrancelha + Mechas Platinada', preco: 130 },
    { nome: 'Hidratação de Cabelo com Máscara (Térmica)', preco: 45 },
    { nome: 'Pintura Global Cabelo (Cores a Escolher)', preco: 60 },
    { nome: 'Sobrancelha', preco: 15 },
  ];

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  const handleBack = () => navigate(-1);
  const handleNavigateHome = () => navigate('/inicio');
  const handleNavigateAgenda = () => navigate('/agenda');
  const handleNavigatePerfil = () => navigate('/perfil');

  const generateTimes = () => {
    const times = [];
    for (let hour = 7; hour <= 22; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return times;
  };

  const closeAll = () => {
    setSelectedIndex(null);
    setSelectedDate(null);
    setSelectedService(null);
    setSelectedTime(null);
    setShowSummary(false);
  };

  const handleAgendar = async () => {
    if (selectedIndex !== null && selectedDate && selectedTime && selectedService) {
      const selectedBarber = barbers[selectedIndex].name;

      // Verifica se o horário já está ocupado para esse barbeiro (no agendamento do usuário)
      const isConflict = agendamentos.some(a =>
        a.barbeiro === selectedBarber &&
        a.data === selectedDate &&
        a.hora === selectedTime
      );

      if (isConflict) {
        alert("❗ Horário já agendado para esse barbeiro, escolha outro horário.");
        return;
      }

      try {
        const clienteLogado = JSON.parse(localStorage.getItem('clienteLogado')) || {};

        const agendamento = {
          barbearia: barbershop?.name || 'Indefinida',
          barbeiro: selectedBarber,
          data: selectedDate,
          hora: selectedTime,
          servico: selectedService.nome,
          preco: selectedService.preco,
          clienteEmail: clienteLogado.email || null,
          clienteUid: clienteLogado.uid || null,
          validado: false,
        };

        await addDoc(collection(db, 'agendamentos'), agendamento);

        alert(`✅ Agendamento confirmado com ${selectedBarber} na ${barbershop?.name} em ${selectedDate} às ${selectedTime}`);
        navigate('/agenda');
        closeAll();

      } catch (error) {
        alert('Erro ao agendar: ' + error.message);
      }
    } else {
      alert("❗ Selecione barbeiro, data, serviço e horário antes de agendar.");
    }
  };

  const selectBarber = (index) => {
    const alreadySelected = selectedIndex === index;
    setSelectedIndex(alreadySelected ? null : index);
    setSelectedDate(null);
    setSelectedService(null);
    setSelectedTime(null);
    setShowSummary(false);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date.toLocaleDateString());
    setSelectedService(null);
    setSelectedTime(null);
    setShowSummary(false);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setShowSummary(true);
  };

  return (
    <div className="selectbarber-container">
      <header className="selectbarber-header">
        <button className="selectbarber-icon" onClick={handleBack} aria-label="Voltar">←</button>
        <h1 className="selectbarber-title">Selecione o Barbeiro</h1>
      </header>

      <main>
        <h2 className="selectbarber-subtitle">Barbearia: {barbershop?.name}</h2>

        {barbers.map((barber, index) => (
          <section className="barber-card" key={index}>
            <article className="barber-full-card">
              <button
                className="barber-image-wrapper-large"
                onClick={() => selectBarber(index)}
                aria-label={`Selecionar ${barber.name}`}
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
                <button
                  className="barber-name"
                  onClick={() => selectBarber(index)}
                >
                  {barber.name}
                </button>
              </div>

              {selectedIndex === index && !selectedDate && (
                <div style={{ overflowX: 'auto' }}>
                  <CalendarioBarber
                    barber={barber}
                    onClose={() => setSelectedIndex(null)}
                    onDateSelect={handleDateSelect}
                  />
                </div>
              )}

              {selectedIndex === index && selectedDate && !selectedService && (
                <ServicosBarber
                  servicos={servicos}
                  onSelecionar={(servico) => setSelectedService(servico)}
                />
              )}

              {selectedIndex === index && selectedService && !selectedTime && (
                <div className="time-selector" style={{ marginTop: '1rem' }}>
                  <h4>Horários disponíveis para {selectedDate}</h4>
                  <div className="time-buttons">
                    {generateTimes().map((time) => {
                      const isBooked = agendamentos.some(a =>
                        a.barbeiro === barbers[selectedIndex].name &&
                        a.data === selectedDate &&
                        a.hora === time
                      );

                      return (
                        <button
                          key={time}
                          className={time === selectedTime ? 'selected' : ''}
                          onClick={() => !isBooked && handleTimeSelect(time)}
                          disabled={isBooked}
                          aria-pressed={time === selectedTime}
                          title={isBooked ? 'Horário indisponível' : 'Horário disponível'}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedIndex === index && showSummary && selectedDate && selectedTime && selectedService && (
                <section className="confirm-section" style={{ marginTop: '1rem' }}>
                  <h3>Resumo do Agendamento</h3>
                  <p><strong>Barbearia:</strong> {barbershop?.name}</p>
                  <p><strong>Barbeiro:</strong> {barber.name}</p>
                  <p><strong>Data:</strong> {selectedDate}</p>
                  <p><strong>Horário:</strong> {selectedTime}</p>
                  <p><strong>Serviço:</strong> {selectedService.nome} - R$ {selectedService.preco.toFixed(2)}</p>
                  <button className="agendar-btn" onClick={handleAgendar}>Agendar agora</button>
                </section>
              )}
            </article>
          </section>
        ))}
      </main>

      <nav className="footer-menu" aria-label="Menu inferior">
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
};

export default SelectBarber;
