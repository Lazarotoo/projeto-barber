// CalendarioBarber.jsx
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Importa o estilo base da lib
import './CalendarioBarber.css'; // Seu estilo customizado

const monthsAbbrev = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const weekDaysAbbrev = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const CalendarioBarber = ({ onClose, onDateSelect }) => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setTimeout(() => {
      const navButtons = document.querySelectorAll('.react-calendar__navigation button');
      navButtons.forEach(btn => btn.removeAttribute('title'));
    }, 100);
    return () => clearTimeout(timer);
  }, [date]);

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    if (onDateSelect) {
      onDateSelect(selectedDate);
    }
  };

  return (
    <div className="inline-calendar">
      <Calendar
        onChange={handleDateChange}
        value={date}
        showNeighboringMonth={false}
        formatMonthYear={(locale, date) => `${monthsAbbrev[date.getMonth()]} ${date.getFullYear()}`}
        formatShortWeekday={(locale, date) => weekDaysAbbrev[date.getDay()]}
      />
      {onClose && (
        <div className="calendar-buttons">
          <button className="cancel-btn" onClick={onClose}>Cancelar</button>
        </div>
      )}
    </div>
  );
};

export default CalendarioBarber;
