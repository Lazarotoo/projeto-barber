import React, { useEffect, useState } from "react";
// Importa componentes do Recharts para criar gráficos
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

// Cores para o gráfico de pizza
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function PainelCEO() {
  // Estado que vai armazenar dados financeiros (exemplo mock)
  const [dadosGanhos, setDadosGanhos] = useState([]);
  // Estado com totais agregados
  const [totais, setTotais] = useState({
    receitaTotal: 0,
    despesasTotal: 0,
    lucroLiquido: 0,
  });

  // useEffect para simular carregamento de dados (mock)
  useEffect(() => {
    // Simulação de dados financeiros por mês
    const dadosMock = [
      { mes: "Jan", receita: 12000, despesa: 4000 },
      { mes: "Fev", receita: 15000, despesa: 5000 },
      { mes: "Mar", receita: 18000, despesa: 7000 },
      { mes: "Abr", receita: 20000, despesa: 8000 },
      { mes: "Mai", receita: 22000, despesa: 9000 },
      { mes: "Jun", receita: 25000, despesa: 10000 },
    ];

    setDadosGanhos(dadosMock);

    // Calcular totais
    const receitaTotal = dadosMock.reduce((acc, item) => acc + item.receita, 0);
    const despesasTotal = dadosMock.reduce((acc, item) => acc + item.despesa, 0);
    const lucroLiquido = receitaTotal - despesasTotal;

    setTotais({ receitaTotal, despesasTotal, lucroLiquido });
  }, []);

  // Preparar dados para gráfico de pizza (distribuição receita vs despesa)
  const dadosPizza = [
    { name: "Receita", value: totais.receitaTotal },
    { name: "Despesa", value: totais.despesasTotal },
  ];

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif", color: "#222" }}>
      {/* Título principal */}
      <h1>Painel do CEO - Gil</h1>

      {/* Totais */}
      <section style={{ marginBottom: 40 }}>
        <h2>Totais Gerais</h2>
        <p>
          <strong>Receita Total:</strong> R$ {totais.receitaTotal.toLocaleString()}
        </p>
        <p>
          <strong>Despesa Total:</strong> R$ {totais.despesasTotal.toLocaleString()}
        </p>
        <p>
          <strong>Lucro Líquido:</strong> R$ {totais.lucroLiquido.toLocaleString()}
        </p>
      </section>

      {/* Gráfico de barras - Receita e Despesa por mês */}
      <section style={{ marginBottom: 40 }}>
        <h2>Receita e Despesa Mensal</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={dadosGanhos}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="receita" fill="#0088FE" name="Receita" />
            <Bar dataKey="despesa" fill="#FF8042" name="Despesa" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Gráfico de pizza - distribuição receita vs despesa */}
      <section>
        <h2>Distribuição Receita x Despesa</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dadosPizza}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {dadosPizza.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
