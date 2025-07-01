// BarberLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BarberLogin.css';

const BARBER_EMAIL = 'barbeiro@exemplo.com';
const BARBER_PASSWORD = 'senha123';

export default function BarberLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === BARBER_EMAIL && password === BARBER_PASSWORD) {
      localStorage.setItem('barberLogado', JSON.stringify({ email }));
      navigate('/barbeiros');
    } else {
      setError('Email ou senha incorretos.');
    }
  };

  return (
    <div className="barber-login-container">
      <form className="barber-login-form" onSubmit={handleSubmit}>
        <h2>Login Barbeiros</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
