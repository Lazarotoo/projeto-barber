import React, { useState, useEffect } from 'react';
import './SelectBarber.css';
import CalendarioBarber from './CalendarioBarber';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function SelectBarber() {
  const navigate = useNavigate();
  const location = useLocation();
  const barbershop = location.state;

  const [agendamentos, setAgendamentos] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

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
        const nome = `${services[i].nome} + ${services[j].nome}`;
        const preco = services[i].preco + services[j].preco - 5;
        combos.push({ nome, preco });
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

  useEffect(() => {
    const fetchAgendamentos = async () => {
      const clienteLogado = JSON.parse(localStorage.getItem('clienteLogado')) || {};
      if (!clienteLogado.uid) return;

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

  const generateTimes = () => {
    const times = [];
    for (let hour = 7; hour <= 22; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return times;
  };

  const handleAgendar = async () => {
    if (selectedIndex !== null && selectedDate && selectedTime && selectedServices.length > 0) {
      const selectedBarber = barbers[selectedIndex].name;
      const isConflict = agendamentos.some(a =>
        a.barbeiro === selectedBarber &&
        a.data === selectedDate &&
        a.hora === selectedTime
      );

      if (isConflict) {
        alert("❗ Horário já agendado para esse barbeiro.");
        return;
      }

      try {
        const clienteLogado = JSON.parse(localStorage.getItem('clienteLogado')) || {};
        const total = selectedServices.reduce((sum, s) => sum + s.preco, 0);

        const agendamento = {
          barbearia: barbershop?.name || 'Indefinida',
          barbeiro: selectedBarber,
          data: selectedDate,
          hora: selectedTime,
          servicos: selectedServices.map(s => s.nome),
          preco: total,
          clienteEmail: clienteLogado.email || null,
          clienteUid: clienteLogado.uid || null,
          validado: false,
        };

        await addDoc(collection(db, 'agendamentos'), agendamento);
        alert(`✅ Agendado com ${selectedBarber} para ${selectedServices.map(s => s.nome).join(', ')}!`);
        navigate('/agenda');

      } catch (error) {
        alert('Erro ao agendar: ' + error.message);
      }
    } else {
      alert("❗ Preencha todas as etapas.");
    }
  };

  const toggleService = (servico) => {
    const isSelected = selectedServices.some(s => s.nome === servico.nome);
    if (isSelected) {
      setSelectedServices(selectedServices.filter(s => s.nome !== servico.nome));
    } else {
      setSelectedServices([...selectedServices, servico]);
    }
  };

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
          <section className="barber-card" key={index}>
            <article className="barber-full-card">
              <button
                className="barber-image-wrapper-large"
                onClick={() => setSelectedIndex(index)}
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
                <button className="barber-name" onClick={() => setSelectedIndex(index)}>
                  {barber.name}
                </button>
              </div>

              {selectedIndex === index && !selectedDate && (
                <CalendarioBarber
                  onDateSelect={(date) => setSelectedDate(date.toLocaleDateString())}
                />
              )}

              {selectedIndex === index && selectedDate && (
              <div>
                <h3>Escolha os serviços:</h3>
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


              {selectedIndex === index && selectedServices.length > 0 && selectedDate && !selectedTime && (
                <div style={{ marginTop: '1rem' }}>
                  <h4>Escolha o horário</h4>
                  <div className="time-buttons">
                    {generateTimes().map(time => (
                      <button
                        key={time}
                        onClick={() => { setSelectedTime(time); setShowSummary(true); }}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showSummary && selectedServices.length > 0 && selectedTime && (
                <section className="confirm-section">
                  <h3>Resumo do Agendamento</h3>
                  <p><strong>Barbeiro:</strong> {barber.name}</p>
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
