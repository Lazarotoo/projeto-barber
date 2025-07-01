import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PainelBarbeiro.css";

export default function PainelBarbeiro() {
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState([]);
  const [barbeiroFiltro, setBarbeiroFiltro] = useState("");
  const [mesFiltro, setMesFiltro] = useState(""); // formato '2025-07'

  useEffect(() => {
    const usuarioTipo = localStorage.getItem("usuarioTipo");
    if (usuarioTipo !== "barbeiro") {
      alert("Acesso negado! Você precisa estar logado como barbeiro.");
      navigate("/login");
      return;
    }

    const fetchAgendamentos = () => {
      const agendamentosSalvos = JSON.parse(localStorage.getItem("agendamentos")) || [];
      setAgendamentos(agendamentosSalvos);
    };

    fetchAgendamentos();
    const interval = setInterval(fetchAgendamentos, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  // Lista única de barbeiros no agendamento para popular filtro
  const barbeirosUnicos = Array.from(
    new Set(agendamentos.map(a => a.barbeiro))
  ).sort();

  // Função para validar conflito (não mudou)
  const isDuplicate = (barbeiro, data, hora) => {
    const count = agendamentos.filter(
      (a) => a.barbeiro === barbeiro && a.data === data && a.hora === hora
    ).length;
    return count > 1;
  };

  const handleValidar = (index) => {
    const agend = agendamentos[index];
    if (agend.validado) {
      alert("Este agendamento já foi validado.");
      return;
    }

    // Marca como validado
    const novosAgendamentos = [...agendamentos];
    novosAgendamentos[index].validado = true;
    setAgendamentos(novosAgendamentos);
    localStorage.setItem("agendamentos", JSON.stringify(novosAgendamentos));

    // Atualiza pontos do cliente
    let clientes = JSON.parse(localStorage.getItem("clientes")) || {};
    const clienteUid = agend.clienteUid;
    if (clienteUid) {
      if (!clientes[clienteUid]) {
        clientes[clienteUid] = { pontos: 0 };
      }
      clientes[clienteUid].pontos = (clientes[clienteUid].pontos || 0) + 10;
      localStorage.setItem("clientes", JSON.stringify(clientes));

      // Dispara evento global para atualizar pontos no perfil
      window.dispatchEvent(new Event("pontosAtualizados"));
    }

    // Remove o agendamento validado da lista local para sumir da tela
    setAgendamentos(novosAgendamentos.filter((_, i) => i !== index));

    alert("Agendamento validado e 10 pontos adicionados ao cliente.");
  };

  // Filtra agendamentos pelo barbeiro selecionado e pelo mês
  const agendamentosFiltrados = agendamentos.filter((a) => {
    if (barbeiroFiltro && a.barbeiro !== barbeiroFiltro) return false;
    if (mesFiltro) {
      // a.data esperado como dd/mm/yyyy
      const [, mes, ano] = a.data.split("/"); // ignorando 'dia'
      if (`${ano}-${mes.padStart(2, "0")}` !== mesFiltro) return false;
    }
    return true;
  });

  // Calcula total de cortes e soma dos valores no mês e barbeiro filtrado
  const totalCortes = agendamentosFiltrados.filter(a => a.validado).length;
  const totalValor = agendamentosFiltrados
    .filter(a => a.validado)
    .reduce((acc, a) => acc + (a.preco || 0), 0);

  return (
    <div className="painel-container">
      <h1>Painel de Controle de Agendamentos</h1>

      <div className="filtros">
        <label>
          Filtrar por barbeiro:
          <select
            value={barbeiroFiltro}
            onChange={(e) => setBarbeiroFiltro(e.target.value)}
          >
            <option value="">Todos</option>
            {barbeirosUnicos.map((b, i) => (
              <option key={i} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>

        <label style={{ marginLeft: "1rem" }}>
          Filtrar por mês:
          <input
            type="month"
            value={mesFiltro}
            onChange={(e) => setMesFiltro(e.target.value)}
          />
        </label>
      </div>

      <div className="resumo">
        <p>
          <strong>Total de cortes validados:</strong> {totalCortes}
        </p>
        <p>
          <strong>Total recebido:</strong> R$ {totalValor.toFixed(2)}
        </p>
      </div>

      {agendamentosFiltrados.length === 0 ? (
        <p>Nenhum agendamento encontrado.</p>
      ) : (
        <table className="painel-table">
          <thead>
            <tr>
              <th>Barbearia</th>
              <th>Barbeiro</th>
              <th>Data</th>
              <th>Hora</th>
              <th>Serviço</th>
              <th>Valor</th>
              <th>Validação</th>
            </tr>
          </thead>
          <tbody>
            {agendamentosFiltrados.map((agendamento, index) => {
              const duplicate = isDuplicate(
                agendamento.barbeiro,
                agendamento.data,
                agendamento.hora
              );
              return (
                <tr key={index} className={duplicate ? "conflito" : ""}>
                  <td data-label="Barbearia">{agendamento.barbearia}</td>
                  <td data-label="Barbeiro">{agendamento.barbeiro}</td>
                  <td data-label="Data">{agendamento.data}</td>
                  <td data-label="Hora">{agendamento.hora}</td>
                  <td data-label="Serviço">{agendamento.servico}</td>
                  <td data-label="Valor">R$ {agendamento.preco?.toFixed(2) || "0.00"}</td>
                  <td data-label="Validação">
                    {agendamento.validado ? (
                      "Validado"
                    ) : (
                      <button
                        className="btn-validar"
                        onClick={() => handleValidar(agendamentos.indexOf(agendamento))}
                      >
                        OK
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
