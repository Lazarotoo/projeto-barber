import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BsCalendarDate } from "react-icons/bs";

export default function PainelBarbeiro() {
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState([]);
  const [barbeiroFiltro, setBarbeiroFiltro] = useState("");
  const [mesFiltro, setMesFiltro] = useState("");

  // Modal estados
  const [modalAberto, setModalAberto] = useState(false);
  const [agendamentoEditando, setAgendamentoEditando] = useState(null);
  const [novoServico, setNovoServico] = useState("");
  const [novaData, setNovaData] = useState(new Date());
  const [novoHorario, setNovoHorario] = useState("");

  // Funções conversão data string <-> Date
  const converteParaDate = (dataStr) => {
    const [dia, mes, ano] = dataStr.split("/");
    return new Date(`${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`);
  };

  const converteParaString = (dateObj) => {
    const dia = String(dateObj.getDate()).padStart(2, "0");
    const mes = String(dateObj.getMonth() + 1).padStart(2, "0");
    const ano = dateObj.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

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

  const barbeirosUnicos = Array.from(new Set(agendamentos.map((a) => a.barbeiro))).sort();

  const isDuplicate = (barbeiro, data, hora, indexAtual) => {
    const count = agendamentos.filter(
      (a, i) => i !== indexAtual && a.barbeiro === barbeiro && a.data === data && a.hora === hora
    ).length;
    return count > 0;
  };

  const handleValidar = (index) => {
    const agend = agendamentos[index];
    if (agend.validado) {
      alert("Este agendamento já foi validado.");
      return;
    }

    const novosAgendamentos = [...agendamentos];
    novosAgendamentos[index].validado = true;
    setAgendamentos(novosAgendamentos);
    localStorage.setItem("agendamentos", JSON.stringify(novosAgendamentos));

    let clientes = JSON.parse(localStorage.getItem("clientes")) || {};
    const clienteUid = agend.clienteUid;
    if (clienteUid) {
      if (!clientes[clienteUid]) {
        clientes[clienteUid] = { pontos: 0 };
      }
      clientes[clienteUid].pontos = (clientes[clienteUid].pontos || 0) + 10;
      localStorage.setItem("clientes", JSON.stringify(clientes));
      window.dispatchEvent(new Event("pontosAtualizados"));
    }

    setAgendamentos(novosAgendamentos.filter((_, i) => i !== index));
    alert("Agendamento validado e 10 pontos adicionados ao cliente.");
  };

  const handleCancelar = (index) => {
    if (window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      const novos = [...agendamentos];
      novos.splice(index, 1);
      setAgendamentos(novos);
      localStorage.setItem("agendamentos", JSON.stringify(novos));
      alert("Agendamento cancelado.");
    }
  };

  // Abre modal e preenche estados com dados atuais do agendamento
  const abrirModalAlterar = (index) => {
    const agendamento = agendamentos[index];
    setAgendamentoEditando({ ...agendamento, index });
    setNovoServico(agendamento.servico);
    setNovaData(converteParaDate(agendamento.data));
    setNovoHorario(agendamento.hora);
    setModalAberto(true);
  };

  // Salvar alterações feitas no modal
  const salvarAlteracao = () => {
    if (!novoServico || !novaData || !novoHorario) {
      alert("Preencha todos os campos.");
      return;
    }

    const dataFormatada = converteParaString(novaData);

    if (isDuplicate(agendamentoEditando.barbeiro, dataFormatada, novoHorario, agendamentoEditando.index)) {
      alert("Já existe um agendamento para este barbeiro, data e horário. Escolha outro horário.");
      return;
    }

    const novos = [...agendamentos];
    novos[agendamentoEditando.index] = {
      ...novos[agendamentoEditando.index],
      servico: novoServico,
      data: dataFormatada,
      hora: novoHorario,
    };

    setAgendamentos(novos);
    localStorage.setItem("agendamentos", JSON.stringify(novos));
    setModalAberto(false);
    alert("Agendamento alterado com sucesso.");
  };

  const agendamentosFiltrados = agendamentos.filter((a) => {
    if (barbeiroFiltro && a.barbeiro !== barbeiroFiltro) return false;
    if (mesFiltro) {
      const [, mes, ano] = a.data.split("/");
      if (`${ano}-${mes.padStart(2, "0")}` !== mesFiltro) return false;
    }
    return true;
  });

  const totalCortes = agendamentosFiltrados.filter((a) => a.validado).length;
  const totalValor = agendamentosFiltrados
    .filter((a) => a.validado)
    .reduce((acc, a) => acc + (a.preco || 0), 0);

  return (
    <div className="painel-container">
      <h1>Painel de Controle de Agendamentos</h1>

      <div className="filtros">
        <label>
          Filtrar por barbeiro:
          <select value={barbeiroFiltro} onChange={(e) => setBarbeiroFiltro(e.target.value)}>
            <option value="">Todos</option>
            {barbeirosUnicos.map((b, i) => (
              <option key={i} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>

        <label>
          Filtrar por mês:
          <input type="month" value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)} />
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
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {agendamentosFiltrados.map((agendamento, index) => {
              const isConflito = isDuplicate(agendamento.barbeiro, agendamento.data, agendamento.hora, index);
              return (
                <tr key={index} className={isConflito ? "conflito" : ""}>
                  <td data-label="Barbearia">{agendamento.barbearia}</td>
                  <td data-label="Barbeiro">{agendamento.barbeiro}</td>
                  <td data-label="Data">{agendamento.data}</td>
                  <td data-label="Hora">{agendamento.hora}</td>
                  <td data-label="Serviço">{agendamento.servico}</td>
                  <td data-label="Valor">R$ {agendamento.preco?.toFixed(2) || "0.00"}</td>
                  <td data-label="Ações">
                    {agendamento.validado ? (
                      "Validado"
                    ) : (
                      <>
                        <button className="btn-validar" onClick={() => handleValidar(index)}>
                          OK
                        </button>
                        <button className="btn-validar" onClick={() => abrirModalAlterar(index)}>
                          Alterar
                        </button>
                        <button className="btn-validar" onClick={() => handleCancelar(index)}>
                          Cancelar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Alterar Agendamento</h2>

            <label>
              Serviço:
              <input type="text" value={novoServico} onChange={(e) => setNovoServico(e.target.value)} />
            </label>

            <label>
              Data:
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <BsCalendarDate size={24} color="#333" />
                <DatePicker
                  selected={novaData}
                  onChange={(date) => setNovaData(date)}
                  dateFormat="dd 'de' MMMM 'de' yyyy"
                  locale="pt-BR"
                  placeholderText="Selecione uma data"
                  withPortal
                />
              </div>
            </label>

            <label>
              Horário:
              <input type="time" value={novoHorario} onChange={(e) => setNovoHorario(e.target.value)} />
            </label>

            <div className="modal-buttons">
              <button onClick={salvarAlteracao} className="btn-validar">
                Salvar
              </button>
              <button onClick={() => setModalAberto(false)} className="btn-validar cancelar">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
