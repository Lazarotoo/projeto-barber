"use client"

import { useEffect, useState, useCallback } from "react"
import "./PainelCEO.css"
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
} from "recharts"
import { collection, getDocs } from "firebase/firestore"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

const mockDadosGanhos = [
  { mes: 1, receita: 15000, despesa: 8000 },
  { mes: 2, receita: 18000, despesa: 9500 },
  { mes: 3, receita: 22000, despesa: 11000 },
  { mes: 4, receita: 19000, despesa: 10200 },
  { mes: 5, receita: 25000, despesa: 12500 },
  { mes: 6, receita: 28000, despesa: 13800 },
  { mes: 7, receita: 32000, despesa: 15000 },
  { mes: 8, receita: 29000, despesa: 14200 },
  { mes: 9, receita: 26000, despesa: 13100 },
  { mes: 10, receita: 31000, despesa: 15800 },
  { mes: 11, receita: 35000, despesa: 17200 },
  { mes: 12, receita: 38000, despesa: 18500 },
]

function App() {
  const [dadosGanhos, setDadosGanhos] = useState([])
  const [totais, setTotais] = useState({
    receitaTotal: 0,
    despesasTotal: 0,
    lucroLiquido: 0,
  })

  const [inputMes, setInputMes] = useState("")
  const [inputAno, setInputAno] = useState(new Date().getFullYear().toString())
  const [inputValorDespesa, setInputValorDespesa] = useState("")
  const [inputDescricaoDespesa, setInputDescricaoDespesa] = useState("")
  const [modalAlertaVisivel, setModalAlertaVisivel] = useState(false)
  const [mensagemAlerta, setMensagemAlerta] = useState("")

  const [firebaseReady, setFirebaseReady] = useState(false)
  const [db, _setDb] = useState(null)
  const [userId, setUserId] = useState(null)

  // Estas variáveis globais são fornecidas pelo ambiente.
  // Usamos 'typeof' para garantir que não causem erros se não existirem.
  const appId = typeof window.__app_id !== "undefined" ? window.__app_id : "default-app-id"

  // Modal de alerta personalizado para substituir 'alert()'
  const mostrarAlerta = (mensagem) => {
    setMensagemAlerta(mensagem)
    setModalAlertaVisivel(true)
  }

  const fecharAlerta = () => {
    setModalAlertaVisivel(false)
    setMensagemAlerta("")
  }

  useEffect(() => {
    setDadosGanhos(mockDadosGanhos)
    const receitaTotal = mockDadosGanhos.reduce((acc, item) => acc + item.receita, 0)
    const despesasTotal = mockDadosGanhos.reduce((acc, item) => acc + item.despesa, 0)

    setTotais({
      receitaTotal,
      despesasTotal,
      lucroLiquido: receitaTotal - despesasTotal,
    })

    setFirebaseReady(true)
    setUserId("demo-user")
  }, []) // Array de dependências correto agora que mockDadosGanhos está fora do componente

  // Função para carregar os dados, memoizada com 'useCallback' para evitar
  // o aviso de dependência do 'useEffect'.
  const carregarDados = useCallback(async () => {
    if (!db || !userId) return

    const anoAtual = new Date().getFullYear()

    try {
      // Receita (agendamentos)
      const agendamentosRef = collection(db, "artifacts", appId, "public", "data", "agendamentos")
      const agendamentosSnapshot = await getDocs(agendamentosRef)
      const receitaPorMes = {}
      let receitaTotal = 0

      agendamentosSnapshot.forEach((doc) => {
        const dados = doc.data()
        if (dados.validado) {
          let data
          if (dados.data?.seconds) {
            data = new Date(dados.data.seconds * 1000)
          } else if (typeof dados.data === "string") {
            const [dia, mes, ano] = dados.data.split("/")
            data = new Date(Number.parseInt(ano), Number.parseInt(mes) - 1, Number.parseInt(dia))
          } else if (dados.data instanceof Date) {
            data = dados.data
          } else {
            console.warn("Formato de data inesperado no agendamento:", dados.data)
            return
          }

          const mes = data.getMonth() + 1
          const ano = data.getFullYear()

          if (ano !== anoAtual) return
          if (!receitaPorMes[mes]) receitaPorMes[mes] = 0
          receitaPorMes[mes] += dados.preco || 0
          receitaTotal += dados.preco || 0
        }
      })

      // Despesas
      const despesasRef = collection(db, "artifacts", appId, "public", "data", "despesas")
      const despesasSnapshot = await getDocs(despesasRef)
      const despesasObj = {}
      let despesasTotal = 0

      despesasSnapshot.forEach((doc) => {
        const d = doc.data()
        if (d.ano === anoAtual) {
          despesasObj[`${d.ano}-${d.mes}`] = { valor: d.valor, descricao: d.descricao }
          despesasTotal += d.valor
        }
      })

      const dadosParaGrafico = []
      for (let m = 1; m <= 12; m++) {
        const receita = receitaPorMes[m] || 0
        const despesa = despesasObj[`${anoAtual}-${m}`]?.valor || 0
        dadosParaGrafico.push({ mes: m, receita, despesa })
      }

      setDadosGanhos(dadosParaGrafico)
      setTotais({
        receitaTotal,
        despesasTotal,
        lucroLiquido: receitaTotal - despesasTotal,
      })
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      mostrarAlerta("Erro ao carregar os dados. Verifique as permissões e o formato dos dados.")
    }
  }, [db, userId, appId])

  // UseEffect para carregar os dados quando o Firebase estiver pronto
  useEffect(() => {
    if (firebaseReady && userId) {
      carregarDados()
    }
  }, [firebaseReady, userId, carregarDados])

  async function salvarDespesa(e) {
    e.preventDefault()

    if (!inputMes || !inputAno || !inputValorDespesa) {
      mostrarAlerta("Preencha todos os campos.")
      return
    }

    const mesNum = Number.parseInt(inputMes)
    const anoNum = Number.parseInt(inputAno)
    const valorNum = Number.parseFloat(inputValorDespesa)

    if (mesNum < 1 || mesNum > 12 || isNaN(mesNum)) {
      mostrarAlerta("Mês inválido. Digite um número entre 1 e 12.")
      return
    }
    if (anoNum < 2000 || anoNum > 2100 || isNaN(anoNum)) {
      mostrarAlerta("Ano inválido. Digite um ano entre 2000 e 2100.")
      return
    }
    if (valorNum <= 0 || isNaN(valorNum)) {
      mostrarAlerta("O valor da despesa deve ser um número positivo.")
      return
    }

    const novosDados = dadosGanhos.map((item) => {
      if (item.mes === mesNum) {
        return { ...item, despesa: valorNum }
      }
      return item
    })

    setDadosGanhos(novosDados)

    const receitaTotal = novosDados.reduce((acc, item) => acc + item.receita, 0)
    const despesasTotal = novosDados.reduce((acc, item) => acc + item.despesa, 0)

    setTotais({
      receitaTotal,
      despesasTotal,
      lucroLiquido: receitaTotal - despesasTotal,
    })

    mostrarAlerta("Despesa salva com sucesso! (Dados simulados - configure Firebase para persistência real)")
    setInputMes("")
    setInputValorDespesa("")
    setInputDescricaoDespesa("")
    setInputAno(new Date().getFullYear().toString())
  }

  const dadosPizza = [
    { name: "Receita", value: totais.receitaTotal > 0 ? totais.receitaTotal : 0.01 },
    { name: "Despesa", value: totais.despesasTotal > 0 ? totais.despesasTotal : 0.01 },
  ]

  return (
    <div className="painel-ceo-container">
      <h1 className="painel-ceo-title">Painel do CEO - Gil</h1>

      <section className="painel-ceo-section">
        <h2 className="painel-ceo-subtitle">Totais Gerais</h2>
        <div className="painel-ceo-totais">
          <p className="painel-ceo-total-text">
            <strong>Receita Total:</strong> R$ {totais.receitaTotal.toFixed(2)}
          </p>
          <p className="painel-ceo-total-text">
            <strong>Despesa Total:</strong> R$ {totais.despesasTotal.toFixed(2)}
          </p>
          <p className="painel-ceo-total-text">
            <strong>Lucro Líquido:</strong> R$ {totais.lucroLiquido.toFixed(2)}
          </p>
        </div>
      </section>

      <section className="painel-ceo-section">
        <h2 className="painel-ceo-subtitle painel-ceo-grafico-titulo">Receita e Despesa Mensal</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dadosGanhos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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

      <section className="painel-ceo-section">
        <h2 className="painel-ceo-subtitle painel-ceo-grafico-titulo">Distribuição Receita x Despesa</h2>
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

      <section className="painel-ceo-section">
        <h2 className="painel-ceo-subtitle">Registrar / Editar Despesa Mensal</h2>
        <form onSubmit={salvarDespesa} className="painel-ceo-form">
          <label className="painel-ceo-label">
            Ano:
            <input
              className="painel-ceo-input"
              type="number"
              value={inputAno}
              onChange={(e) => setInputAno(e.target.value)}
              min="1000"
              max="9999"
              required
            />
          </label>
          <label className="painel-ceo-label">
            Mês (1-12):
            <input
              className="painel-ceo-input"
              type="number"
              value={inputMes}
              onChange={(e) => setInputMes(e.target.value)}
              min="1"
              max="12"
              required
            />
          </label>
          <label className="painel-ceo-label">
            Valor da Despesa:
            <input
              className="painel-ceo-input"
              type="number"
              value={inputValorDespesa}
              onChange={(e) => setInputValorDespesa(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </label>
          <label className="painel-ceo-label">
            Descrição:
            <input
              className="painel-ceo-input"
              type="text"
              value={inputDescricaoDespesa}
              onChange={(e) => setInputDescricaoDespesa(e.target.value)}
            />
          </label>
          <button type="submit" className="painel-ceo-button">
            Salvar Despesa
          </button>
        </form>
      </section>

      {modalAlertaVisivel && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "12px",
              maxWidth: "400px",
              textAlign: "center",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3 style={{ marginBottom: "15px", color: "#1e40af" }}>Aviso</h3>
            <p style={{ marginBottom: "20px", lineHeight: "1.5" }}>{mensagemAlerta}</p>
            <button onClick={fecharAlerta} className="painel-ceo-button">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
