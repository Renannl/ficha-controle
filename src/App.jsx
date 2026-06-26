import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { useFichas } from "./hooks/useFichas";
import LoginScreen from "./components/LoginScreen";
import HomeScreen from "./components/home/HomeScreen";
import AdminPanel from "./components/admin/AdminPanel";
import ColecaoScreen from "./components/colecao/ColecaoScreen";
import FichaView from "./components/ficha/FichaView";
import { useColecoes } from "./hooks/useColecoes";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import { testSupabase } from "./testSupabase";
import "./App-v2.css";

export default function App() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const {
    fichas,
    isLoading,
    criarFicha,
    atualizarFicha,
    excluirFicha,
    getFicha,
    atualizarOperadores,
  } = useFichas(user);
  const { colecoes } = useColecoes();
  const navigate = useNavigate();

  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  useEffect(() => {
    testSupabase();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ─── Carregar usuários (unificado em um único useEffect) ───
  useEffect(() => {
    async function carregarUsuarios() {
      const { data, error } = await supabase.from("users").select("*");
      if (error) {
        console.error("Erro ao carregar usuários:", error);
        return;
      }
      setUsuarios(data || []);
    }
    carregarUsuarios();
  }, []);

  // ─── Tela de boas-vindas ───
  useEffect(() => {
    if (!showWelcome) return;
    const t = setTimeout(() => {
      setShowWelcome(false);
      navigate("/dashboard");
    }, 2000);
    return () => clearTimeout(t);
  }, [showWelcome]);

  function formatNome(username) {
    if (!username) return "";
    return username
      .split(".")
      .map(
        (p) =>
          p.charAt(0).toLocaleUpperCase("pt-BR") +
          p.slice(1).toLocaleLowerCase("pt-BR"),
      )
      .join(" ");
  }

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  // ─── LOADING ───
  if (isLoading) {
    return (
      <div
        className="loading-screen"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--bg-base)",
          color: "var(--text-primary)",
          gap: "16px",
        }}
      >
        <div className="login-spinner" />
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          Carregando fichas...
        </p>
      </div>
    );
  }

  // ─── BOAS-VINDAS ───
  if (showWelcome) {
    return (
      <div className="welcome-screen">
        <img src="/ip.png" className="welcome-logo" />
        <h1 className="welcome-text">Bem-vindo, {welcomeUser}</h1>
      </div>
    );
  }

  // ─── NÃO AUTENTICADO ───
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <LoginScreen
              onLogin={async (u, s) => {
                const success = await login(u, s);
                if (success) {
                  setWelcomeUser(formatNome(u));
                  setShowWelcome(true);
                }
                return success;
              }}
            />
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // ─── Criar nova ficha e já navegar para ela ───
  // Mapa de tipo amigável → código numérico da operação
  // ✅ Corrigido — adiciona "fotos"
  const TIPO_PARA_OPERACAO = {
    taf: 50,
    producao: 10,
    fotos: 80, // ← bate com o onCreateFicha("fotos") do NewFichaMenu
    controle: 80, // ← mantém por compatibilidade
    qualidade: 90,
  };

  async function handleNova(tipo, colecaoId = null) {
    const operacaoCodigo = TIPO_PARA_OPERACAO[tipo] ?? tipo;
    const id = await criarFicha(operacaoCodigo, colecaoId);
    if (!id) return;

    // ✅ Sempre navega para o dashboard — sem rota de coleção
    navigate(`/dashboard/ficha/${id}`);
  }

  function handleOpen(id) {
    navigate(`/dashboard/ficha/${id}`);
  }

  function handleDelete(e, id) {
    e?.stopPropagation?.();
    excluirFicha(id);
  }

  // ─── ROTAS ───
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<Navigate to="/dashboard" />} />
      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <div className="app">
            <HomeScreen
              fichas={fichas}
              onNova={handleNova}
              listaUsuarios={usuarios}
              onOpen={handleOpen}
              onDelete={handleDelete}
              onAtualizarOperadores={atualizarOperadores}
              user={user}
              onLogout={logout}
              theme={theme}
              onToggleTheme={toggleTheme}
              onOpenAdmin={() => navigate("/admin")}
            />
          </div>
        }
      />
      {/* Ficha aberta pelo dashboard */}
      <Route
        path="/dashboard/ficha/:fichaId"
        element={
          <FichaView
            user={user}
            atualizarFicha={atualizarFicha}
            getFicha={getFicha}
            excluirFicha={excluirFicha}
            origem="dashboard"
          />
        }
      />

      <Route
        path="/admin"
        element={
          user?.role === "admin" ? (
            <AdminPanel onBack={() => navigate("/dashboard")} />
          ) : (
            <Navigate to="/dashboard" />
          )
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
