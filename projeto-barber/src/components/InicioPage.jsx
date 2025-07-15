import React, { useEffect, useState } from "react";
import "./InicioPage.css";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

export default function InicioPage() {
  const navigate = useNavigate();
  const [clienteNome, setClienteNome] = useState("");

  useEffect(() => {
    // Corrigido para pegar do localStorage correto
    const logado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!logado?.nome || logado.role !== "cliente") {
      navigate("/login");
    } else {
      setClienteNome(logado.nome);
    }
  }, [navigate]);

  const handleNavigate = (barbershop) => {
    navigate("/select-barber", { state: barbershop });
  };

  return (
    <div className="inicio-root">
      <div>
        {/* Header com saudação e logout alinhados */}
        <div className="inicio-header">
          <div className="header-top">
            {clienteNome && (
              <p className="cliente-saudacao">Olá, {clienteNome}</p>
            )}
            <LogoutButton />
          </div>
          <h2 className="inicio-title">Selecione a Barbershop</h2>
        </div>

        <div className="inicio-grid">
          {/* Barber 1 */}
          <div className="inicio-barber-card">
            <div
              className="inicio-barber-image"
              style={{ backgroundImage: 'url("/images/RBI IGUAÇU FOTO.webp")' }}
            ></div>
            <div>
              <button
                className="inicio-barber-name"
                onClick={() =>
                  handleNavigate({
                    name: "RBI IGUAÇU",
                    desc: "Rua Capivari, 354 - Iguaçu, Araucária - PR, 83701-440",
                    image: "/images/RBI IGUAÇU FOTO.webp",
                  })
                }
              >
                RBI IGUAÇU
              </button>
              <p className="inicio-barber-desc">
                Rua Capivari, 354 - Iguaçu, Araucária - PR, 83701-440
              </p>
            </div>
          </div>

          {/* Barber 2 */}
          <div className="inicio-barber-card">
            <div
              className="inicio-barber-image"
              style={{
                backgroundImage: 'url("/images/WhatsApp Image 2025-06-23 at 14.28.05.jpeg")',
              }}
            ></div>
            <div>
              <button
                className="inicio-barber-name"
                onClick={() =>
                  handleNavigate({
                    name: "Barbearia Central",
                    desc: "Rua Manoel Ribas, 1174 - Centro, Araucária - PR, 83702-035",
                    image: "https://via.placeholder.com/400x250?text=Barbearia+2",
                  })
                }
              >
                Barbearia Central
              </button>
              <p className="inicio-barber-desc">
                Rua Manoel Ribas, 1174 - Centro, Araucária - PR, 83702-035
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
