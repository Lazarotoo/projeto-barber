import React, { useEffect, useState } from "react";
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
import { collection, getDocs, setDoc, doc } from "firebase/firestore"; // removi query e where
import { db } from "../firebase";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function PainelCEO() {
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

  async function carregarDados() {
    const anoAtual = new Date().getFullYear();
    const agendamentosRef = collection(db, "agendamentos");
    const agendamentosSnapshot = await getDocs(agendamentosRef);

    const receitaPorMes = {};

    agendamentosSnapshot.forEach((doc) => {
      const dados = doc.data();
      const data = new Date(dados.data.seconds * 1000);
      const mes = data.getMonth() + 1;
      const ano = data.getFullYear();

      if (ano !== anoAtual) return;

      if (!receitaPorMes[mes]) receitaPorMes[mes] = 0;
      receitaPorMes[mes] += dados.valor || 0;
    });

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

  useEffect(() => {
    carregarDados();
  }, []);

  async function salvarDespesa(e) {
    e.preventDefault();

    if (!inputMes || !inputAno || !inputValorDespesa) {
      alert("Preencha todos os campos.");
      return;
    }

    const mesNum = parseInt(inputMes);
    const anoNum = parseInt(inputAno);
    const valorNum = parseFloat(inputValorDespesa);

    const docId = `${anoNum}-${mesNum}`;

    await setDoc(doc(db, "despesas", docId), {
      ano: anoNum,
      mes: mesNum,
      valor: valorNum,
      descricao: inputDescricaoDespesa,
    });

    alert("Despesa salva com sucesso!");
    setInputMes("");
    setInputValorDespesa("");
    setInputDescricaoDespesa("");

    carregarDados();
  }

  const dadosPizza = [
    { name: "Receita", value: totais.receitaTotal },
    { name: "Despesa", value: totais.despesasTotal },
  ];

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif", color: "#222" }}>
      <h1>Painel do CEO - Gil</h1>

      <section style={{ marginBottom: 40 }}>
        <h2>Totais Gerais</h2>
        <p>
          <strong>Receita Total:</strong> R$ {totais.receitaTotal.toFixed(2)}
        </p>
        <p>
          <strong>Despesa Total:</strong> R$ {totais.despesasTotal.toFixed(2)}
        </p>
        <p>
          <strong>Lucro Líquido:</strong> R$ {totais.lucroLiquido.toFixed(2)}
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2>Receita e Despesa Mensal</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dadosGanhos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" tickFormatter={(m) => ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][m-1]} />
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
