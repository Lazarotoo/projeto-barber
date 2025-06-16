import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import InicioPage from "./components/InicioPage";
import SelectBarber from "./components/SelectBarber";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/inicio" element={<InicioPage />} />
        <Route path="/select-barber" element={<SelectBarber />} />
      </Routes>
    </Router>
  );
}

export default App;
