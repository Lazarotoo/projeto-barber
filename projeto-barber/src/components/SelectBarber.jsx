import React, { useState } from 'react';
import './SelectBarber.css';
import CalendarioBarber from './CalendarioBarber';
import { useNavigate } from 'react-router-dom';

const SelectBarber = () => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleBack = () => navigate(-1);

  const barbers = [
    { name: 'Barbeiro 1', img: 'https://randomuser.me/api/portraits/men/31.jpg' },
    { name: 'Barbeiro 2', img: 'https://randomuser.me/api/portraits/men/41.jpg' },
    { name: 'Barbeiro 3', img: 'https://randomuser.me/api/portraits/men/51.jpg' },
    { name: 'Barbeiro 4', img: 'https://randomuser.me/api/portraits/men/61.jpg' },
  ];

  return (
    <div className="selectbarber-container">
      <div>
        <div className="selectbarber-header">
          <div className="selectbarber-icon" onClick={handleBack}>←</div>
          <h2 className="selectbarber-title">Selecione o Barbeiro</h2>
        </div>

        <h2 className="selectbarber-subtitle">Barbeiros Disponíveis</h2>

        {barbers.map((barber, index) => (
          <div className="barber-card" key={index}>
            <div className="barber-full-card">
              <div
                className="barber-image-wrapper-large"
                onClick={() =>
                  setSelectedIndex(selectedIndex === index ? null : index)
                }
                style={{ cursor: 'pointer' }}
              >
                <div
                  className="barber-image-background"
                  style={{ backgroundImage: "url('/transparent-background.png')" }}
                ></div>
                <div
                  className="barber-image"
                  style={{ backgroundImage: `url(${barber.img})` }}
                ></div>
              </div>
              <div className="barber-info">
                <p
                  className="barber-name"
                  onClick={() =>
                    setSelectedIndex(selectedIndex === index ? null : index)
                  }
                  style={{ cursor: 'pointer' }}
                >
                  {barber.name}
                </p>
              </div>
              {selectedIndex === index && (
                <div style={{ overflowX: 'auto' }}>
                  <CalendarioBarber
                    barber={barber}
                    onClose={() => setSelectedIndex(null)}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="footer-menu">
        <a href="#"><div className="footer-icon">🏠</div><p>Início</p></a>
        <a href="#"><div className="footer-icon">🔍</div><p>Buscar</p></a>
        <a href="#"><div className="footer-icon">📅</div><p>Agenda</p></a>
        <a href="#"><div className="footer-icon">👤</div><p>Perfil</p></a>
      </div>
      <div className="footer-space"></div>
    </div>
  );
};

export default SelectBarber;
