import React, { useEffect, useState, useCallback } from "react";
import './PainelCEO.css'
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
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirestore, collection, getDocs, setDoc, doc } from "firebase/firestore";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function App() {
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
  const [modalAlertaVisivel, setModalAlertaVisivel] = useState(false);
  const [mensagemAlerta, setMensagemAlerta] = useState("");

  const [firebaseReady, setFirebaseReady] = useState(false);
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);

  // Estas variáveis globais são fornecidas pelo ambiente.
  // Usamos 'typeof' para garantir que não causem erros se não existirem.
  // eslint-disable-next-line no-undef
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

  // Modal de alerta personalizado para substituir 'alert()'
  const mostrarAlerta = (mensagem) => {
    setMensagemAlerta(mensagem);
    setModalAlertaVisivel(true);
  };

  const fecharAlerta = () => {
    setModalAlertaVisivel(false);
    setMensagemAlerta("");
  };

  // Inicialização e autenticação do Firebase.
  // Esta lógica é necessária porque não temos um ficheiro 'firebase.js' separado.
  useEffect(() => {
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(firebaseConfig) : {};
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? initialAuthToken : null;

    if (!firebaseConfig || Object.keys(firebaseConfig).length === 0) {
      console.error("A configuração do Firebase está em falta.");
      return;
    }

    const app = initializeApp(firebaseConfig, appId);
    const authInstance = getAuth(app);
    const dbInstance = getFirestore(app);

    setDb(dbInstance);

    const checkAuth = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(authInstance, initialAuthToken);
        } else {
          await signInAnonymously(authInstance);
        }
      } catch (error) {
        console.error("Erro de autenticação:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
      setFirebaseReady(true);
    });

    checkAuth();
    return () => unsubscribe();
  }, [appId]);

  // Função para carregar os dados, memoizada com 'useCallback' para evitar
  // o aviso de dependência do 'useEffect'.
  const carregarDados = useCallback(async () => {
    if (!db || !userId) return;

    const anoAtual = new Date().getFullYear();

    try {
      // Receita (agendamentos)
      const agendamentosRef = collection(db, "artifacts", appId, "public", "data", "agendamentos");
      const agendamentosSnapshot = await getDocs(agendamentosRef);
      const receitaPorMes = {};
      let receitaTotal = 0;

      agendamentosSnapshot.forEach((doc) => {
        const dados = doc.data();
        if (dados.validado) {
          let data;
          if (dados.data?.seconds) {
            data = new Date(dados.data.seconds * 1000);
          } else if (typeof dados.data === 'string') {
            const [dia, mes, ano] = dados.data.split('/');
            data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
          } else if (dados.data instanceof Date) {
            data = dados.data;
          } else {
            console.warn("Formato de data inesperado no agendamento:", dados.data);
            return;
          }

          const mes = data.getMonth() + 1;
          const ano = data.getFullYear();

          if (ano !== anoAtual) return;
          if (!receitaPorMes[mes]) receitaPorMes[mes] = 0;
          receitaPorMes[mes] += dados.preco || 0;
          receitaTotal += dados.preco || 0;
        }
      });

      // Despesas
      const despesasRef = collection(db, "artifacts", appId, "public", "data", "despesas");
      const despesasSnapshot = await getDocs(despesasRef);
      const despesasObj = {};
      let despesasTotal = 0;

      despesasSnapshot.forEach((doc) => {
        const d = doc.data();
        if (d.ano === anoAtual) {
          despesasObj[`${d.ano}-${d.mes}`] = { valor: d.valor, descricao: d.descricao };
          despesasTotal += d.valor;
        }
      });

      const dadosParaGrafico = [];
      for (let m = 1; m <= 12; m++) {
        const receita = receitaPorMes[m] || 0;
        const despesa = despesasObj[`${anoAtual}-${m}`]?.valor || 0;
        dadosParaGrafico.push({ mes: m, receita, despesa });
      }

      setDadosGanhos(dadosParaGrafico);
      setTotais({
        receitaTotal,
        despesasTotal,
        lucroLiquido: receitaTotal - despesasTotal,
      });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      mostrarAlerta("Erro ao carregar os dados. Verifique as permissões e o formato dos dados.");
    }
  }, [db, userId, appId]);

  // UseEffect para carregar os dados quando o Firebase estiver pronto
  useEffect(() => {
    if (firebaseReady && userId) {
      carregarDados();
    }
  }, [firebaseReady, userId, carregarDados]);

  async function salvarDespesa(e) {
    e.preventDefault();

    if (!db) {
      mostrarAlerta("A base de dados não está pronta.");
      return;
    }
    if (!inputMes || !inputAno || !inputValorDespesa) {
      mostrarAlerta("Preencha todos os campos.");
      return;
    }

    const mesNum = parseInt(inputMes);
    const anoNum = parseInt(inputAno);
    const valorNum = parseFloat(inputValorDespesa);

    if (mesNum < 1 || mesNum > 12 || isNaN(mesNum)) {
      mostrarAlerta("Mês inválido. Digite um número entre 1 e 12.");
      return;
    }
    if (anoNum < 2000 || anoNum > 2100 || isNaN(anoNum)) {
      mostrarAlerta("Ano inválido. Digite um ano entre 2000 e 2100.");
      return;
    }
    if (valorNum <= 0 || isNaN(valorNum)) {
      mostrarAlerta("O valor da despesa deve ser um número positivo.");
      return;
    }

    const docId = `${anoNum}-${String(mesNum).padStart(2, '0')}`;
    const despesasCollectionRef = collection(db, "artifacts", appId, "public", "data", "despesas");

    try {
      await setDoc(doc(despesasCollectionRef, docId), {
        ano: anoNum,
        mes: mesNum,
        valor: valorNum,
        descricao: inputDescricaoDespesa,
      }, { merge: true });

      mostrarAlerta("Despesa salva com sucesso!");
      setInputMes("");
      setInputValorDespesa("");
      setInputDescricaoDespesa("");
      carregarDados();
    } catch (error) {
      mostrarAlerta("Erro ao salvar despesa: " + error.message);
      console.error("Erro ao salvar despesa:", error);
    }
  }

  const dadosPizza = [
    { name: "Receita", value: totais.receitaTotal > 0 ? totais.receitaTotal : 0.01 },
    { name: "Despesa", value: totais.despesasTotal > 0 ? totais.despesasTotal : 0.01 },
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 font-['Inter']">
      <div className="max-w-7xl mx-auto my-6 p-6 sm:p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-center mb-8 font-bold text-3xl sm:text-4xl text-gray-800">
          Painel do CEO - Gil
        </h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold border-b-2 pb-2 mb-4 text-gray-700">
            Totais Gerais
          </h2>
          <div className="flex flex-wrap justify-between text-lg">
            <p className="w-full md:w-1/3 mb-2">
              <strong className="text-blue-600">Receita Total:</strong> R$ {totais.receitaTotal.toFixed(2)}
            </p>
            <p className="w-full md:w-1/3 mb-2">
              <strong className="text-red-600">Despesa Total:</strong> R$ {totais.despesasTotal.toFixed(2)}
            </p>
            <p className="w-full md:w-1/3 mb-2">
              <strong className="text-green-600">Lucro Líquido:</strong> R$ {totais.lucroLiquido.toFixed(2)}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <section className="p-4 bg-gray-50 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Receita e Despesa Mensal
            </h2>
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

          <section className="p-4 bg-gray-50 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Distribuição Receita x Despesa
            </h2>
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
        </div>

        <section className="p-6 bg-gray-50 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Registrar / Editar Despesa Mensal
          </h2>
          <form onSubmit={salvarDespesa} className="flex flex-wrap items-end gap-4">
            <label className="flex-1 min-w-[150px]">
              <span className="block text-sm font-medium text-gray-700">Ano:</span>
              <input
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                type="number"
                value={inputAno}
                onChange={(e) => setInputAno(e.target.value)}
                min="2000"
                max="2100"
                required
              />
            </label>
            <label className="flex-1 min-w-[150px]">
              <span className="block text-sm font-medium text-gray-700">Mês (1-12):</span>
              <input
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                type="number"
                value={inputMes}
                onChange={(e) => setInputMes(e.target.value)}
                min="1"
                max="12"
                required
              />
            </label>
            <label className="flex-1 min-w-[150px]">
              <span className="block text-sm font-medium text-gray-700">Valor da Despesa:</span>
              <input
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                type="number"
                value={inputValorDespesa}
                onChange={(e) => setInputValorDespesa(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </label>
            <label className="flex-1 min-w-[200px]">
              <span className="block text-sm font-medium text-gray-700">Descrição:</span>
              <input
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                type="text"
                value={inputDescricaoDespesa}
                onChange={(e) => setInputDescricaoDespesa(e.target.value)}
              />
            </label>
            <button
              type="submit"
              className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Salvar Despesa
            </button>
          </form>
        </section>

        {modalAlertaVisivel && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white text-center">
              <h3 className="text-xl font-bold mb-4">Aviso</h3>
              <p className="mb-4">{mensagemAlerta}</p>
              <button
                onClick={fecharAlerta}
                className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-24 shadow-sm hover:bg-blue-600"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
