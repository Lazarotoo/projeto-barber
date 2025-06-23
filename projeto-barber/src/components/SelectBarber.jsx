import React, { useState } from 'react';
import './SelectBarber.css';
import CalendarioBarber from './CalendarioBarber';
import { useNavigate } from 'react-router-dom';

const SelectBarber = () => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  const handleBack = () => navigate(-1);
  const handleNavigateHome = () => navigate('/inicio');
  const handleNavigateAgenda = () => navigate('/agenda');
  const handleNavigatePerfil = () => navigate('/perfil'); // Navega para Perfil

  const barbers = [
    { name: 'Barbeiro 1', img: 'https://randomuser.me/api/portraits/men/31.jpg' },
    { name: 'Barbeiro 2', img: 'https://randomuser.me/api/portraits/men/41.jpg' },
    { name: 'Barbeiro 3', img: 'https://randomuser.me/api/portraits/men/51.jpg' },
    { name: 'Barbeiro 4', img: 'https://randomuser.me/api/portraits/men/61.jpg' },
  ];

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
    setSelectedTime(null);
    setShowTimeSelector(false);
    setShowSummary(false);
  };

  const handleAgendar = () => {
    if (selectedIndex !== null && selectedDate && selectedTime) {
      const selectedBarber = barbers[selectedIndex].name;

      const agendamento = {
        barbeiro: selectedBarber,
        data: selectedDate,
        hora: selectedTime,
      };

      const agendamentosSalvos = JSON.parse(localStorage.getItem('agendamentos')) || [];
      agendamentosSalvos.push(agendamento);
      localStorage.setItem('agendamentos', JSON.stringify(agendamentosSalvos));

      alert(`✅ Agendamento confirmado com ${selectedBarber} em ${selectedDate} às ${selectedTime}`);

      navigate('/agenda');

      closeAll();
    } else {
      alert("❗ Selecione barbeiro, data e horário antes de agendar.");
    }
  };

  const selectBarber = (index) => {
    const alreadySelected = selectedIndex === index;
    setSelectedIndex(alreadySelected ? null : index);
    setSelectedDate(null);
    setSelectedTime(null);
    setShowTimeSelector(false);
    setShowSummary(false);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date.toLocaleDateString());
    setShowTimeSelector(true);
    setShowSummary(false);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setShowTimeSelector(false);
    setShowSummary(true);
  };

  return (
    <div className="selectbarber-container">
      <header className="selectbarber-header">
        <button className="selectbarber-icon" onClick={handleBack} aria-label="Voltar">←</button>
        <h1 className="selectbarber-title">Selecione o Barbeiro</h1>
      </header>

      <main>
        <h2 className="selectbarber-subtitle">Barbeiros Disponíveis</h2>

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

              {selectedIndex === index && showTimeSelector && (
                <div className="time-selector" style={{ marginTop: '1rem' }}>
                  <h4>Horários disponíveis para {selectedDate}</h4>
                  <div className="time-buttons">
                    {generateTimes().map((time) => (
                      <button
                        key={time}
                        className={time === selectedTime ? 'selected' : ''}
                        onClick={() => handleTimeSelect(time)}
                        aria-pressed={time === selectedTime}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedIndex === index && showSummary && selectedDate && selectedTime && (
                <section className="confirm-section" style={{ marginTop: '1rem' }}>
                  <h3>Resumo do Agendamento</h3>
                  <p><strong>Barbeiro:</strong> {barber.name}</p>
                  <p><strong>Data:</strong> {selectedDate}</p>
                  <p><strong>Horário:</strong> {selectedTime}</p>
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
