import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { useFichas } from "./hooks/useFichas";
import { OPERACOES, getChecklistItems } from "./data/fichaTemplate";
import LoginScreen from "./components/LoginScreen";
import Header from "./components/header/Header";
import InfoCard from "./components/info/InfoCard";
import ChecklistTable from "./components/ChecklistTable";
import SessionsPanel from "./components/SessionsPanel";
import NotesSection from "./components/NotesSection";
import SignatureSection from "./components/SignatureSection";
import HomeScreen from "./components/home/HomeScreen";
import PrintView from "./components/PrintView";
import TafPanel from "./components/TafPanel";
import PhotoPanel from "./components/PhotoPanel";
import ConsideracoesPanel from "./components/ConsideracoesPanel";
import AdminPanel from "./components/admin/AdminPanel";
import ConfirmModal from "./components/ConfirmModal";
import RejectModal from "./components/RejectModal";
import { exportFicha } from "./services/sharepointService";
import "./App-v2.css";
import { testSupabase } from "./testSupabase";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

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
  const [currentFichaId, setCurrentFichaId] = useState(null);
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("activeTab") || "info",
  );
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState("");
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    testSupabase();
  }, []);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    async function carregarUsuarios() {
      const { data, error } = await supabase.from("users").select("*");

      console.log("DATA USERS:", data);
      console.log("ERROR USERS:", error);

      if (error) return;
      console.log(data);
      setUsuarios(data || []);
    }

    carregarUsuarios();
  }, []);

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
  const navigate = useNavigate();
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
  const [rejectInfo, setRejectInfo] = useState(null);

  const ficha = currentFichaId ? getFicha(currentFichaId) || null : null;

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

  if (showWelcome) {
    return (
      <div className="welcome-screen">
        <img src="/ip.png" className="welcome-logo" />

        <h1 className="welcome-text">Bem-vindo, {welcomeUser}</h1>
      </div>
    );
  }
  // ─── LOGIN ───
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

  async function handleNova(operacaoCodigo) {
    const id = await criarFicha(operacaoCodigo);
    setCurrentFichaId(id);

    if (!id) return;

    // Se for TAF (50), abre direto em testes, senão em dados
    setActiveTab(operacaoCodigo === "50" ? "taf" : "info");
  }

  function handleApprove(id, estado) {
    if (estado === "reprovado") {
      setRejectInfo({ id });

      return;
    }

    atualizarFicha(id, {
      statusAprovacao: "aprovado",

      aprovadoPor: user?.nome || user?.username,

      aprovadoEm: new Date().toISOString(),

      // limpa reprovação anterior
      reprovadoPor: "",
      reprovadoEm: "",
      motivoReprovacao: "",
    });
  }

  function confirmReject(reason) {
    if (!rejectInfo) return;

    atualizarFicha(rejectInfo.id, {
      statusAprovacao: "reprovado",
      status: "andamento",

      motivoReprovacao: reason,

      reprovadoPor: user?.nome || user?.username,

      reprovadoEm: new Date().toISOString(),

      // limpa aprovação anterior
      aprovadoPor: "",
      aprovadoEm: "",

      alteracoesFeitas: "",
    });

    setRejectInfo(null);
  }

  function handleOpen(id) {
    const f = getFicha(id);
    setCurrentFichaId(id);
    setActiveTab(f?.tafData ? "taf" : "info");
  }

  function handleBack() {
    setCurrentFichaId(null);
    setActiveTab("info");
  }

  function handleDelete(id) {
    excluirFicha(id);
    if (currentFichaId === id) {
      setCurrentFichaId(null);
    }
  }
  const podeEditarFicha = (ficha) => {
    // admin sempre pode
    if (user?.role === "admin") {
      return true;
    }

    // dono da ficha pode editar
    if (ficha?.userId === user?.username) {
      return true;
    }

    // permissão especial
    return user?.permissoes?.includes("editar_ficha");
  };

  function updateField(field, value) {
    if (!podeEditarFicha(ficha)) {
      return;
    }

    atualizarFicha(currentFichaId, (prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleOperacaoChange(novoCodigo) {
    const op = OPERACOES[novoCodigo];
    if (!op) return;

    atualizarFicha(currentFichaId, (prev) => ({
      ...prev,
      operacao: novoCodigo,
      equipe: op.equipe,
      objetivo: op.objetivo,
      items: op.items.map((item) => ({
        id: item.id,
        descricao: item.descricao,
        sessao: item.sessao || "",
        sessionMarks: Array(15).fill(""),
        resultado: "",
        foto: "",
      })),
    }));
  }

  function updateItem(itemIndex, key, value) {
    if (!podeEditarFicha(ficha)) {
      return;
    }

    atualizarFicha(currentFichaId, (prev) => {
      const items = [...prev.items];
      items[itemIndex] = { ...items[itemIndex], [key]: value };
      return { ...prev, items };
    });
  }

  function updateItemSessionMark(itemIndex, sessionIndex, value) {
    if (!podeEditarFicha(ficha)) {
      return;
    }

    atualizarFicha(currentFichaId, (prev) => {
      const items = [...prev.items];
      const marks = [...items[itemIndex].sessionMarks];
      marks[sessionIndex] = marks[sessionIndex] === value ? "" : value;
      items[itemIndex] = { ...items[itemIndex], sessionMarks: marks };
      return { ...prev, items };
    });
  }

  function updateSession(sessionIndex, field, value) {
    if (!podeEditarFicha(ficha)) {
      return;
    }

    atualizarFicha(currentFichaId, (prev) => {
      const sessions = [...prev.sessions];
      sessions[sessionIndex] = { ...sessions[sessionIndex], [field]: value };
      return { ...prev, sessions };
    });
  }

  function updateSignature(role, dataUrl) {
    if (!podeEditarFicha(ficha)) {
      return;
    }

    atualizarFicha(currentFichaId, (prev) => ({
      ...prev,
      assinaturas: {
        ...prev.assinaturas,
        [role]: {
          ...prev.assinaturas[role],
          dataUrl,
          data: dataUrl ? new Date().toLocaleDateString("pt-BR") : "",
        },
      },
    }));
  }

  function updateSignatureName(role, nome) {
    if (!podeEditarFicha(ficha)) {
      return;
    }

    atualizarFicha(currentFichaId, (prev) => ({
      ...prev,
      assinaturas: {
        ...prev.assinaturas,
        [role]: { ...prev.assinaturas[role], nome },
      },
    }));
  }

  async function handleFinalizar() {
    if (!ficha) return;

    // Se a ficha já está finalizada, é obrigatório registrar as alterações feitas
    if (
      (ficha.status === "finalizada" ||
        ficha.statusAprovacao === "reprovado") &&
      (!ficha.alteracoesFeitas || !ficha.alteracoesFeitas.trim())
    ) {
      alert(
        "⚠️ Como esta ficha já foi avaliada ou finalizada antes, é obrigatório preencher o campo 'Alterações Feitas' na aba 'Notas' indicando o que foi modificado.",
      );
      return;
    }

    // 1. Atualizar status para finalizada e resetar aprovação para nova validação
    atualizarFicha(currentFichaId, {
      status: "finalizada",
      statusAprovacao: "aguardando",
      finalizadaAt: new Date().toISOString(),
    });

    // 2. Pequeno delay para garantir que o React renderizou o novo estado no PrintView
    await new Promise((r) => setTimeout(r, 500));

    // 3. Chamar o serviço de exportação (PDF + SharePoint Mock)
    const success = await exportFicha(ficha, "print-view-root");

    if (success) {
      setSuccessModal({
        isOpen: true,
        title: "Sucesso!",
        message:
          "Ficha finalizada com sucesso! O PDF foi gerado e enviado para seus downloads.",
      });
    } else {
      setSuccessModal({
        isOpen: true,
        title: "Erro",
        message:
          "Houve um problema ao gerar o PDF. Verifique sua conexão ou tente novamente.",
        type: "danger",
      });
    }
  }

  function getProgress() {
    if (!ficha) return 0;

    const total = ficha?.items?.length || 0;

    const done =
      ficha?.items?.filter((i) => i.resultado === "ok" || i.resultado === "na")
        .length || 0;

    return total > 0 ? Math.round((done / total) * 100) : 0;
  }

  const isTaf = !!ficha?.tafData;
  const isFoto = ficha?.operacao === "80";

  const tabs = isTaf
    ? [
        { id: "taf", icon: "⚡", label: "Testes" },
        { id: "checklist", icon: "✅", label: "Funcionais e Visuais" },
        { id: "signatures", icon: "✍️", label: "Assinaturas" },
      ]
    : isFoto
      ? [
          { id: "info", icon: "📋", label: "Dados" },
          { id: "fotos", icon: "📸", label: "Fotos" },
          { id: "notes", icon: "📝", label: "Notas" },
        ]
      : [
          { id: "info", icon: "📋", label: "Dados" },
          { id: "checklist", icon: "✅", label: "Checklist" },
          { id: "sessions", icon: "🕐", label: "Sessões" },
          { id: "notes", icon: "📝", label: "Notas" },
          { id: "signatures", icon: "✍️", label: "Assinaturas" },
        ];

  const checklistItems = ficha ? getChecklistItems(ficha.operacao) : [];

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
      />

      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <LoginScreen
              onLogin={async (u, s) => {
                const success = await login(u, s);

                if (success) {
                  navigate("/dashboard");
                }

                return success;
              }}
            />
          ) : (
            <Navigate to="/dashboard" />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          !ficha ? (
            <div className="app">
              <HomeScreen
                fichas={fichas}
                onNova={handleNova}
                listaUsuarios={usuarios}
                onOpen={handleOpen}
                onDelete={handleDelete}
                onAtualizarOperadores={atualizarOperadores}
                user={user}
                onLogout={() => {
                  logout();
                }}
                theme={theme}
                onToggleTheme={toggleTheme}
                onOpenAdmin={() => navigate("/admin")}
                onApprove={handleApprove}
              />
            </div>
          ) : (
            <>
              <div className="app">
                <Header
                  ficha={ficha}
                  user={user}
                  progress={getProgress()}
                  onBack={handleBack}
                  onApprove={(estado) => handleApprove(currentFichaId, estado)}
                />

                <main className="main-content">
                  {activeTab === "info" &&
                    (!isFoto ? (
                      <InfoCard
                        ficha={ficha}
                        onChange={updateField}
                        onOperacaoChange={handleOperacaoChange}
                      />
                    ) : (
                      <ConsideracoesPanel
                        ficha={ficha}
                        onUpdateHeader={updateField}
                        onUpdateFotoData={(newData) =>
                          atualizarFicha(ficha.id, {
                            fotoData: {
                              ...ficha.fotoData,
                              ...newData,
                            },
                          })
                        }
                      />
                    ))}

                  {activeTab === "checklist" && (
                    <ChecklistTable
                      ficha={ficha}
                      checklistItems={checklistItems}
                      onToggleMark={updateItemSessionMark}
                      onSetResultado={(idx, val) =>
                        updateItem(idx, "resultado", val)
                      }
                      isTaf={isTaf}
                      tafData={ficha.tafData}
                      onUpdateTaf={(newData) =>
                        atualizarFicha(ficha.id, {
                          tafData: {
                            ...ficha.tafData,
                            ...newData,
                          },
                        })
                      }
                    />
                  )}

                  {activeTab === "taf" && isTaf && (
                    <TafPanel
                      ficha={ficha}
                      onUpdate={(newData) =>
                        atualizarFicha(ficha.id, (prev) => ({
                          ...prev,
                          ...newData,
                        }))
                      }
                    />
                  )}

                  {activeTab === "fotos" && isFoto && (
                    <PhotoPanel
                      ficha={ficha}
                      items={ficha.items}
                      onUpdate={(idx, key, val) => updateItem(idx, key, val)}
                    />
                  )}

                  {activeTab === "sessions" && (
                    <SessionsPanel
                      sessions={ficha.sessions}
                      onUpdate={updateSession}
                    />
                  )}

                  {activeTab === "notes" && (
                    <NotesSection
                      ficha={ficha}
                      observacoes={ficha.observacoes}
                      onChange={(val) => updateField("observacoes", val)}
                      onChangeAlteracoes={(val) =>
                        updateField("alteracoesFeitas", val)
                      }
                      isFoto={isFoto}
                      onFinalizar={handleFinalizar}
                    />
                  )}

                  {activeTab === "signatures" && (
                    <SignatureSection
                      ficha={ficha}
                      assinaturas={ficha.assinaturas}
                      onSign={updateSignature}
                      onNameChange={updateSignatureName}
                      onFinalizar={handleFinalizar}
                    />
                  )}
                </main>

                <nav className="tab-bar">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span className="tab-icon">{tab.icon}</span>

                      <span className="tab-label">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {ficha && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    zIndex: -9999,
                  }}
                >
                  <PrintView ficha={ficha} />
                </div>
              )}

              <ConfirmModal
                isOpen={successModal.isOpen}
                title={successModal.title}
                message={successModal.message}
                type={successModal.type || "success"}
                confirmText="Entendido"
                showCancel={false}
                onConfirm={() => {
                  setSuccessModal({
                    ...successModal,
                    isOpen: false,
                  });

                  if (successModal.title === "Sucesso!") {
                    handleBack();
                  }
                }}
              />

              <RejectModal
                isOpen={!!rejectInfo}
                onClose={() => setRejectInfo(null)}
                onConfirm={confirmReject}
              />
            </>
          )
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
