import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import InicioPage from "./components/InicioPage";
import SelectBarber from "./components/SelectBarber";
import AgendaCliente from "./components/AgendaCliente";
import Perfil from "./components/Perfil"; // Importando o componente Perfil

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/inicio" element={<InicioPage />} />
        <Route path="/select-barber" element={<SelectBarber />} />
        <Route path="/agenda" element={<AgendaCliente />} />
        <Route path="/perfil" element={<Perfil />} /> {/* Nova rota para Perfil */}
      </Routes>
    </Router>
  );
}

export default App;
