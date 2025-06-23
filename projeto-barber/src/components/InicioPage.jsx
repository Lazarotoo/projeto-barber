import React, { useEffect, useState } from "react";
import "./InicioPage.css";
import { useNavigate } from "react-router-dom";

export default function InicioPage() {
  const navigate = useNavigate();
  const [clienteNome, setClienteNome] = useState("");

  useEffect(() => {
    const logado = JSON.parse(localStorage.getItem("clienteLogado"));
    if (!logado?.name) {
      navigate("/login");
    } else {
      setClienteNome(logado.name);
    }
  }, [navigate]);

  const handleNavigate = (barbershop) => {
    navigate("/select-barber", { state: barbershop });
  };

  return (
    <div className="inicio-root">
      <div>
        <div className="inicio-header">
          {clienteNome && (
            <p className="cliente-saudacao">
              Olá, {clienteNome}
            </p>
          )}
          <h2 className="inicio-title">Selecione a Barbershop</h2>
        </div>

        <div className="inicio-grid">
          {/* Barber 1 */}
          <div className="inicio-barber-card">
            <div
              className="inicio-barber-image"
              style={{
                backgroundImage: 'url("/images/RBI IGUAÇU FOTO.webp")',
              }}
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
                backgroundImage:
                  'url("https://via.placeholder.com/400x250?text=Barbearia+2")',
              }}
            ></div>
            <div>
              <button
                className="inicio-barber-name"
                onClick={() =>
                  handleNavigate({
                    name: "Barbearia Central",
                    desc: "Av. das Nações, 123 - Centro, Araucária - PR",
                    image: "https://via.placeholder.com/400x250?text=Barbearia+2",
                  })
                }
              >
                Barbearia Central
              </button>
              <p className="inicio-barber-desc">
                Av. das Nações, 123 - Centro, Araucária - PR
              </p>
            </div>
          </div>

          {/* Barber 3 */}
          <div className="inicio-barber-card">
            <div
              className="inicio-barber-image"
              style={{
                backgroundImage:
                  'url("https://via.placeholder.com/400x250?text=Barbearia+3")',
              }}
            ></div>
            <div>
              <button
                className="inicio-barber-name"
                onClick={() =>
                  handleNavigate({
                    name: "Barber Gold",
                    desc: "Rua das Rosas, 77 - Estação, Araucária - PR",
                    image: "https://via.placeholder.com/400x250?text=Barbearia+3",
                  })
                }
              >
                Barber Gold
              </button>
              <p className="inicio-barber-desc">
                Rua das Rosas, 77 - Estação, Araucária - PR
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
