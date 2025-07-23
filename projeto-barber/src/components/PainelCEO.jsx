// PainelCEO.js (versão ajustada)

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function PainelCEO() {
  const navigate = useNavigate(); // Inicializar useNavigate
  const [dadosGanhos, setDadosGanhos] = useState([]);
  const [totais, setTotais] = useState({
    receitaTotal: 0,
    despesasTotal: 0,
    lucroLiquido: 0,
  });

  const [inputMes, setInputMes] = useState("");
  const [inputAno, setInputAno] = useState(new Date().getFullYear());
  const [inputValorDespesa, setInputValorDespesa] = useState("");
  const [inputDescricaoDespesa, setInputDescricaoDespesa] = useState("");

  // Adicionar useEffect para proteção de rota
  useEffect(() => {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuarioLogado || usuarioLogado.role !== "ceo") {
      alert("Acesso negado! Você precisa estar logado como CEO.");
      navigate("/login"); // Redireciona para a tela de login
      return;
    }
  }, [navigate]); // Adicionar navigate como dependência

  async function carregarDados() {
    const anoAtual = new Date().getFullYear();

    // Receita (agendamentos)
    const agendamentosRef = collection(db, "agendamentos");
    const agendamentosSnapshot = await getDocs(agendamentosRef);

    const receitaPorMes = {};

    agendamentosSnapshot.forEach((doc) => {
      const dados = doc.data();
      // Ajuste para lidar com campos de data que podem ser Timestamp ou String
      let data;
      if (dados.data?.seconds) {
        data = new Date(dados.data.seconds * 1000);
      } else if (typeof dados.data === 'string') {
        // Assume formato "dd/mm/aaaa" e converte para Date
        const [dia, mes, ano] = dados.data.split('/');
        data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      } else if (dados.data instanceof Date) {
        data = dados.data;
      } else {
        console.warn("Formato de data inesperado no agendamento:", dados.data);
        return; // Pula este agendamento se a data for inválida
      }

      const mes = data.getMonth() + 1;
      const ano = data.getFullYear();

      if (ano !== anoAtual) return;

      if (!receitaPorMes[mes]) receitaPorMes[mes] = 0;
      receitaPorMes[mes] += dados.preco || 0; // Use 'preco' para receita de agendamentos
    });

    // Despesas
    const despesasRef = collection(db, "despesas");
    const despesasSnapshot = await getDocs(despesasRef);
    const despesasObj = {};
    despesasSnapshot.forEach((doc) => {
      const d = doc.data();
      despesasObj[`${d.ano}-${d.mes}`] = { valor: d.valor, descricao: d.descricao };
    });

    const dadosParaGrafico = [];
    let receitaTotal = 0;
    let despesasTotal = 0;
    for (let m = 1; m <= 12; m++) {
      const receita = receitaPorMes[m] || 0;
      const despesa = despesasObj[`${anoAtual}-${m}`]?.valor || 0;

      receitaTotal += receita;
      despesasTotal += despesa;

      dadosParaGrafico.push({
        mes: m,
        receita,
        despesa,
      });
    }

    setDadosGanhos(dadosParaGrafico);
    setTotais({
      receitaTotal,
      despesasTotal,
      lucroLiquido: receitaTotal - despesasTotal,
    });
  }

  // O useEffect original para carregarDados permanece, mas agora roda após a verificação de role.
  useEffect(() => {
    // Carrega dados APÓS a verificação de acesso
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (usuarioLogado?.role === "ceo") { // Garante que só carrega se for CEO
      carregarDados();
    }
  }, []); // Dependências vazias para rodar uma vez na montagem

  async function salvarDespesa(e) {
    e.preventDefault();

    if (!inputMes || !inputAno || !inputValorDespesa) {
      alert("Preencha todos os campos.");
      return;
    }

    const mesNum = parseInt(inputMes);
    const anoNum = parseInt(inputAno);
    const valorNum = parseFloat(inputValorDespesa);

    // Validação básica para mês e ano
    if (mesNum < 1 || mesNum > 12 || isNaN(mesNum)) {
      alert("Mês inválido. Digite um número entre 1 e 12.");
      return;
    }
    if (anoNum < 2000 || anoNum > 2100 || isNaN(anoNum)) {
      alert("Ano inválido. Digite um ano entre 2000 e 2100.");
      return;
    }
    if (valorNum <= 0 || isNaN(valorNum)) {
      alert("Valor da despesa deve ser um número positivo.");
      return;
    }


    const docId = `${anoNum}-${String(mesNum).padStart(2, '0')}`; // Formato "AAAA-MM" para consistência

    try {
        await setDoc(doc(db, "despesas", docId), {
            ano: anoNum,
            mes: mesNum,
            valor: valorNum,
            descricao: inputDescricaoDespesa,
        }, { merge: true }); // Use merge para atualizar se o documento já existir

        alert("Despesa salva com sucesso!");
        setInputMes("");
        setInputValorDespesa("");
        setInputDescricaoDespesa("");

        carregarDados(); // Recarrega os dados para atualizar o gráfico
    } catch (error) {
        alert("Erro ao salvar despesa: " + error.message);
        console.error("Erro ao salvar despesa:", error);
    }
  }

  const dadosPizza = [
    { name: "Receita", value: totais.receitaTotal > 0 ? totais.receitaTotal : 0.01 }, // Evita divisão por zero
    { name: "Despesa", value: totais.despesasTotal > 0 ? totais.despesasTotal : 0.01 }, // Evita divisão por zero
  ];

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif", color: "#222" }}>
      <h1>Painel do CEO - Gil</h1>

      <section style={{ marginBottom: 40 }}>
        <h2>Totais Gerais</h2>
        <p><strong>Receita Total:</strong> R$ {totais.receitaTotal.toFixed(2)}</p>
        <p><strong>Despesa Total:</strong> R$ {totais.despesasTotal.toFixed(2)}</p>
        <p><strong>Lucro Líquido:</strong> R$ {totais.lucroLiquido.toFixed(2)}</p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2>Receita e Despesa Mensal</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={dadosGanhos}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="mes"
              tickFormatter={(m) =>
                ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][m - 1]
              }
            />
            <YAxis />
            <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="receita" fill="#0088FE" name="Receita" />
            <Bar dataKey="despesa" fill="#FF8042" name="Despesa" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2>Distribuição Receita x Despesa</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dadosPizza}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {dadosPizza.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
          </PieChart>
        </ResponsiveContainer>
      </section>

      <section>
        <h2>Registrar / Editar Despesa Mensal</h2>
        <form onSubmit={salvarDespesa} style={{ marginBottom: 20 }}>
          <label>
            Ano:{" "}
            <input
              type="number"
              value={inputAno}
              onChange={(e) => setInputAno(e.target.value)}
              min="2000"
              max="2100"
              required
              style={{ width: 80 }}
            />
          </label>
          <label style={{ marginLeft: 20 }}>
            Mês (1-12):{" "}
            <input
              type="number"
              value={inputMes}
              onChange={(e) => setInputMes(e.target.value)}
              min="1"
              max="12"
              required
              style={{ width: 60 }}
            />
          </label>
          <label style={{ marginLeft: 20 }}>
            Valor da Despesa: R${" "}
            <input
              type="number"
              value={inputValorDespesa}
              onChange={(e) => setInputValorDespesa(e.target.value)}
              min="0"
              step="0.01"
              required
              style={{ width: 100 }}
            />
          </label>
          <label style={{ marginLeft: 20 }}>
            Descrição:{" "}
            <input
              type="text"
              value={inputDescricaoDespesa}
              onChange={(e) => setInputDescricaoDespesa(e.target.value)}
              style={{ width: 200 }}
            />
          </label>
          <button type="submit" style={{ marginLeft: 20 }}>
            Salvar Despesa
          </button>
        </form>
      </section>
    </div>
  );
}