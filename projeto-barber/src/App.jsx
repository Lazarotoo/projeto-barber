import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import InicioPage from "./components/InicioPage";
import SelectBarber from "./components/SelectBarber";
import AgendaCliente from "./components/AgendaCliente";
import Perfil from "./components/Perfil";
import PainelBarbeiro from "./components/PainelBarbeiro";
import BarberLogin from "./components/BarberLogin";
import PrivateRouteBarber from "./components/PrivateRouteBarber";
import PrivateRouteCEO from "./components/PrivateRouteCEO";
import PainelCEO from "./components/PainelCEO";
import NotFoundPage from "./components/NotFoundPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/inicio" element={<InicioPage />} />
        <Route path="/select-barber" element={<SelectBarber />} />
        <Route path="/agenda" element={<AgendaCliente />} />
        <Route path="/perfil" element={<Perfil />} />

        <Route path="/barber-login" element={<BarberLogin />} />

        {/* Rotas protegidas */}
        <Route
          path="/barbeiros"
          element={
            <PrivateRouteBarber>
              <PainelBarbeiro />
            </PrivateRouteBarber>
          }
        />
        <Route
          path="/ceo"
          element={
            <PrivateRouteCEO>
              <PainelCEO />
            </PrivateRouteCEO>
          }
        />

        {/* Rota fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
