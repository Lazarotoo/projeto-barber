// PainelBarbeiro.js (versão ajustada)

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BsCalendarDate } from "react-icons/bs";
import "./PainelBarbeiro.css";

export default function PainelBarbeiro() {
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState([]);
  const [barbeiroFiltro, setBarbeiroFiltro] = useState("");
  const [mesFiltro, setMesFiltro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [agendamentoEditando, setAgendamentoEditando] = useState(null);
  const [novoServico, setNovoServico] = useState("");
  const [novaData, setNovaData] = useState(new Date());
  const [novoHorario, setNovoHorario] = useState("");

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
    // Pega o objeto usuarioLogado completo do localStorage
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    // Verifica se o usuário está logado e se a role é "barbeiro"
    if (!usuarioLogado || usuarioLogado.role !== "barbeiro") {
      alert("Acesso negado! Você precisa estar logado como barbeiro.");
      navigate("/login");
      return;
    }

    const fetchAgendamentos = async () => {
      const querySnapshot = await getDocs(collection(db, "agendamentos"));
      const agendamentosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAgendamentos(agendamentosData);
    };

    fetchAgendamentos();

    const interval = setInterval(fetchAgendamentos, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleValidar = async (index) => {
    const agend = agendamentos[index];
    if (agend.validado) return alert("Este agendamento já foi validado.");

    try {
      await updateDoc(doc(db, "agendamentos", agend.id), { validado: true });

      // Otimização: A sua coleção de clientes é "usuarios" no Firestore, certo?
      // Se sim, precisamos ajustar a referência aqui.
      const clienteRef = doc(db, "usuarios", agend.clienteUid); // Alterado de "clientes" para "usuarios"
      const clienteSnap = await getDoc(clienteRef);

      if (clienteSnap.exists()) {
        const clienteData = clienteSnap.data();
        const pontosAtuais = clienteData.pontos || 0;
        const novosPontos = pontosAtuais + 10;

        await updateDoc(clienteRef, { pontos: novosPontos });

        // A atualização do localStorage do cliente é um pouco mais complexa aqui,
        // pois a PainelBarbeiro não lida diretamente com o cliente logado.
        // Se a "HomePage" ou "InicioPage" leem "usuarioLogado", a atualização
        // dos pontos do cliente só será vista quando o cliente recarregar ou relogar.
        // O evento "pontosAtualizados" é uma boa ideia, mas você precisaria de um listener no cliente.
        // Por enquanto, vou remover a parte de atualização direta de "clienteLogado"
        // e "clientes" no localStorage do PainelBarbeiro, pois isso pode ser inconsistente
        // se o cliente não estiver logado na mesma sessão ou em outro dispositivo.
        // A fonte da verdade para os pontos é o Firestore.

        // window.dispatchEvent(new Event("pontosAtualizados")); // Manter se você tiver um listener no cliente
      }

      const novos = [...agendamentos];
      novos[index].validado = true;
      setAgendamentos(novos);

      alert("Agendamento validado e pontos adicionados.");
    } catch (error) {
      alert("Erro ao validar: " + error.message);
    }
  };

  const handleCancelar = async (index) => {
    if (!window.confirm("Cancelar este agendamento?")) return;

    try {
      await deleteDoc(doc(db, "agendamentos", agendamentos[index].id));
      const novos = agendamentos.filter((_, i) => i !== index);
      setAgendamentos(novos);
      alert("Agendamento cancelado.");
    } catch (error) {
      alert("Erro ao cancelar: " + error.message);
    }
  };

  const abrirModalAlterar = (index) => {
    const agendamento = agendamentos[index];
    setAgendamentoEditando({ ...agendamento, index });
    setNovoServico(agendamento.servico);
    setNovaData(converteParaDate(agendamento.data));
    setNovoHorario(agendamento.hora);
    setModalAberto(true);
  };

  const salvarAlteracao = async () => {
    if (!novoServico || !novaData || !novoHorario) return alert("Preencha todos os campos.");

    try {
      const dataFormatada = converteParaString(novaData);
      const agend = agendamentoEditando;

      await updateDoc(doc(db, "agendamentos", agend.id), {
        servico: novoServico,
        data: dataFormatada,
        hora: novoHorario,
      });

      const novos = [...agendamentos];
      novos[agend.index] = { ...novos[agend.index], servico: novoServico, data: dataFormatada, hora: novoHorario };
      setAgendamentos(novos);
      setModalAberto(false);
      alert("Agendamento alterado com sucesso.");
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    }
  };

  const barbeirosUnicos = [...new Set(agendamentos.map(a => a.barbeiro))].sort();

  const agendamentosFiltrados = agendamentos.filter(a => {
    if (barbeiroFiltro && a.barbeiro !== barbeiroFiltro) return false;
    if (mesFiltro) {
      const [, mes, ano] = a.data.split("/");
      if (`${ano}-${mes.padStart(2, "0")}` !== mesFiltro) return false;
    }
    return true;
  });

  const totalCortes = agendamentosFiltrados.filter(a => a.validado).length;
  const totalValor = agendamentosFiltrados.filter(a => a.validado).reduce((acc, a) => acc + (a.preco || 0), 0);

  return (
    <div className="painel-container">
      <h1>Painel de Controle de Agendamentos</h1>

      <div className="filtros">
        <label>
          Filtrar por barbeiro:
          <select value={barbeiroFiltro} onChange={(e) => setBarbeiroFiltro(e.target.value)}>
            <option value="">Todos</option>
            {barbeirosUnicos.map((b, i) => (
              <option key={i} value={b}>{b}</option>
            ))}
          </select>
        </label>

        <label>
          Filtrar por mês:
          <input type="month" value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)} />
        </label>
      </div>

      <div className="resumo">
        <p><strong>Total de cortes validados:</strong> {totalCortes}</p>
        <p><strong>Total recebido:</strong> R$ {totalValor.toFixed(2)}</p>
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
            {agendamentosFiltrados.map((ag, idx) => (
              <tr key={idx}>
                <td data-label="Barbearia">{ag.barbearia}</td>
                <td data-label="Barbeiro">{ag.barbeiro}</td>
                <td data-label="Data">{ag.data}</td>
                <td data-label="Hora">{ag.hora}</td>
                <td data-label="Serviço">{ag.servico}</td>
                <td data-label="Valor">R$ {ag.preco?.toFixed(2) || "0.00"}</td>
                <td data-label="Ações">
                  {ag.validado ? (
                    "Validado"
                  ) : (
                    <div className="acoes-botoes">
                      <button className="btn-validar validar" onClick={() => handleValidar(idx)}>OK</button>
                      <button className="btn-validar alterar" onClick={() => abrirModalAlterar(idx)}>Alterar</button>
                      <button className="btn-validar cancelar" onClick={() => handleCancelar(idx)}>Cancelar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
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
                  dateFormat="dd/MM/yyyy"
                  locale="pt-BR"
                />
              </div>
            </label>
            <label>
              Horário:
              <input type="time" value={novoHorario} onChange={(e) => setNovoHorario(e.target.value)} />
            </label>
            <div className="modal-buttons">
              <button className="btn-validar validar" onClick={salvarAlteracao}>Salvar</button>
              <button className="btn-validar cancelar" onClick={() => setModalAberto(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}