import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import './CalendarioBarber.css';

const monthsAbbrev = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const weekDaysAbbrev = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const CalendarioBarber = ({ barber, onClose }) => {
  const [date, setDate] = useState(new Date());

  // Remove tooltips dos botões após renderizar
  useEffect(() => {
    const navButtons = document.querySelectorAll('.react-calendar__navigation button');
    navButtons.forEach((btn) => btn.removeAttribute('title'));
  }, [date]); // executa sempre que a data mudar (calendário renderizar)

  const handleConfirm = () => {
    alert(`Horário marcado com ${barber.name} em ${date.toLocaleDateString()}`);
    onClose();
  };

  return (
    <div className="inline-calendar">
      <Calendar
        onChange={setDate}
        value={date}
        showNeighboringMonth={false}
        formatMonthYear={(locale, date) => (
          <>
            <span>{monthsAbbrev[date.getMonth()]}</span><br />
            <span style={{ fontSize: '0.8em' }}>{date.getFullYear()}</span>
          </>
        )}
        formatShortWeekday={(locale, date) => weekDaysAbbrev[date.getDay()]}
      />
      <div className="calendar-buttons">
        <button onClick={handleConfirm}>Confirmar</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
};

export default CalendarioBarber;
