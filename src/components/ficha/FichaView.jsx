import Header from "../header/Header";
import InfoCard from "../info/InfoCard";
import ChecklistTable from "../checklist/ChecklistTable";
import SessoesTrabalhoList from "../sessions/SessoesTrabalhoList";
import NotesSection from "../notes/NotesSection";
import SignatureSection from "../signatures/SignatureSection";
import PrintView from "../print/PrintView";
import TafPanel from "../taf/TafPanel";
import PhotoPanel from "../photoupload/PhotoPanel";
import ConsideracoesPanel from "../consideracoes/ConsideracoesPanel";
import ConfirmModal from "../buttons/ConfirmModal";
import ApproveModal from "../buttons/ApproveModal";
import BotaoSessaoTrabalho from "../buttons/BotaoSessaoTrabalho";
import RejectModal from "../buttons/RejectModal";
import ChecklistLogList from "../sessions/CheckListLogList";
import { useSessoesTrabalho } from "../../hooks/useSessoesTrabalho";
import { useChecklistLog } from "../../hooks/useChecklistLog";
import { getChecklistItems, buildPainelItems } from "../../data/fichaTemplate";
import { getPainelChecklistItems } from "../../data/painelTemplates";
import { useNavigate, useParams } from "react-router-dom";
import { exportFicha } from "../../services/sharepointService";
import { useState, useEffect, useCallback } from "react";

export default function FichaView({
  user,
  fichas,
  atualizarFicha,
  getFicha,
  excluirFicha,
  origem,
}) {
  const { fichaId, id: colecaoId } = useParams();
  const navigate = useNavigate();
  const [ficha, setFicha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const { sessoes, loadSessoes } = useSessoesTrabalho(ficha?.dbId);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
  const [rejectInfo, setRejectInfo] = useState(null);
  const [approveInfo, setApproveInfo] = useState(null);
  const { registrarMarcacao } = useChecklistLog(ficha?.dbId);
  const sessaoIniciada = sessoes.some(
    (s) => !s.fim && s.usuario === user?.username,
  );

  // 1. Busca inicial
  useEffect(() => {
    let cancelled = false;
    async function buscar() {
      setLoading(true);
      const resultado = await getFicha(fichaId);
      if (!cancelled) {
        setFicha(resultado);
        setLoading(false);
      }
    }
    buscar();
    return () => {
      cancelled = true;
    };
  }, [fichaId]);

  // 2. ✅ Mantém ficha sincronizada com o estado global do hook
  useEffect(() => {
    if (!fichaId || !fichas) return;
    const atualizada = fichas.find(
      (f) =>
        String(f.dbId) === String(fichaId) || String(f.id) === String(fichaId),
    );
    if (atualizada) setFicha(atualizada);
  }, [fichas, fichaId]);

  // ─── Ajusta aba inicial quando a ficha carregar ───
  useEffect(() => {
    if (!ficha) return;
    const op = String(ficha.operacao ?? "");
    if (op === "50") setActiveTab("taf");
    else if (op === "80") setActiveTab("fotos");
    else setActiveTab("info");
  }, [ficha?.operacao]);

  // ─── Callbacks estáveis para fotoData ───
  const handleUpdateFotoData = useCallback(
    (updater) => {
      atualizarFicha(fichaId, (prev) => ({
        ...prev,
        fotoData:
          typeof updater === "function"
            ? updater(prev.fotoData ?? {})
            : { ...prev.fotoData, ...updater },
      }));
    },
    [fichaId, atualizarFicha],
  );

  function handleTipoPainelChange(novoTipo) {
    atualizarFicha(fichaId, (prev) => ({
      ...prev,
      tipoPainel: novoTipo,
      items: buildPainelItems(novoTipo),
    }));
  }

  const handleUpdateConsideracoes = useCallback(
    (updater) => {
      atualizarFicha(fichaId, (prev) => ({
        ...prev,
        fotoData:
          typeof updater === "function"
            ? updater(prev.fotoData ?? {})
            : { ...prev.fotoData, ...updater },
      }));
    },
    [fichaId, atualizarFicha],
  );

  // ─── Callback estável para tafData ───
  const handleUpdateTaf = useCallback(
    (newData) => {
      atualizarFicha(fichaId, (prev) => ({
        ...prev,
        tafData: { ...prev.tafData, ...newData },
      }));
    },
    [fichaId, atualizarFicha],
  );

  // ─── Callback estável para TafPanel ───
  const handleUpdateTafPanel = useCallback(
    (newData) => {
      atualizarFicha(fichaId, (prev) => ({ ...prev, ...newData }));
    },
    [fichaId, atualizarFicha],
  );

  // ─── Voltar ───
  function handleBack() {
    if (origem === "colecao") {
      navigate(`/colecao/${colecaoId}`);
    } else {
      navigate("/dashboard");
    }
  }

  // ─── Loading ───
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: 16,
          background: "var(--bg-base)",
          color: "var(--text-secondary)",
        }}
      >
        <div className="login-spinner" />
        <p style={{ fontSize: 14 }}>Carregando ficha...</p>
      </div>
    );
  }

  // ─── Não encontrada ───
  if (!ficha) {
    return (
      <div
        style={{
          padding: 32,
          textAlign: "center",
          color: "var(--text-secondary)",
        }}
      >
        Ficha não encontrada.
      </div>
    );
  }

  // ─── Permissão ───
  function podeEditar() {
    const ok =
      user?.role === "admin" ||
      ficha?.userId === user?.username ||
      user?.permissoes?.includes("editar_ficha");
    return ok;
  }

  // ─── Helpers de update ───
  function updateField(field, value) {
    if (!podeEditar()) return;
    atualizarFicha(fichaId, (prev) => ({ ...prev, [field]: value }));
  }

  function updateItem(itemIndex, key, value) {
    if (!sessaoIniciada) return; // 🔒
    const item = ficha.items[itemIndex];

    atualizarFicha(fichaId, (prev) => {
      const items = [...prev.items];
      items[itemIndex] = { ...items[itemIndex], [key]: value };
      return { ...prev, items };
    });

    if (key === "resultado" && value) {
      const template = activeChecklistItems.find((c) => c.id === item.id);
      registrarMarcacao({
        itemId: item.id,
        descricao: template?.descricao || `Item ${item.id}`,
        campo: "resultado",
        valor: value,
        usuario: user?.nome || user?.username,
      });
    }
  }

  // ─── ✅ Novo: atualiza resultado + observação em uma única operação ───
  function updateItemResultado(itemIndex, resultado, observacao = "") {
    if (!sessaoIniciada) return; // 🔒
    const item = ficha.items[itemIndex];

    atualizarFicha(fichaId, (prev) => {
      const items = [...prev.items];
      items[itemIndex] = { ...items[itemIndex], resultado, observacao };
      return { ...prev, items };
    });

    if (resultado) {
      const template = activeChecklistItems.find((c) => c.id === item.id);
      registrarMarcacao({
        itemId: item.id,
        descricao: template?.descricao || `Item ${item.id}`,
        campo: "resultado",
        valor: resultado,
        observacao,
        usuario: user?.nome || user?.username,
      });
    }
  }

  function updateItemSessionMark(itemIndex, sessionIndex, value) {
    if (!sessaoIniciada) return;
    if (!podeEditar()) return;

    const item = ficha.items[itemIndex];
    const novoValor = item.sessionMarks[sessionIndex] === value ? "" : value;

    atualizarFicha(fichaId, (prev) => {
      const items = [...prev.items];
      const marks = [...items[itemIndex].sessionMarks];
      marks[sessionIndex] = novoValor;
      items[itemIndex] = { ...items[itemIndex], sessionMarks: marks };
      return { ...prev, items };
    });

    if (novoValor) {
      const template = activeChecklistItems.find((c) => c.id === item.id);
      registrarMarcacao({
        itemId: item.id,
        descricao: template?.descricao || `Item ${item.id}`,
        campo: "sessionMark",
        valor: novoValor,
        sessaoIndex: sessionIndex,
        usuario: user?.nome || user?.username,
      });
    }
  }

  function updateSession(sessionIndex, field, value) {
    if (!podeEditar()) return;
    atualizarFicha(fichaId, (prev) => {
      const sessions = [...prev.sessions];
      sessions[sessionIndex] = { ...sessions[sessionIndex], [field]: value };
      return { ...prev, sessions };
    });
  }

  function updateSignature(role, dataUrl) {
    if (!podeEditar()) return;
    atualizarFicha(fichaId, (prev) => ({
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
    if (!podeEditar()) return;
    atualizarFicha(fichaId, (prev) => ({
      ...prev,
      assinaturas: {
        ...prev.assinaturas,
        [role]: { ...prev.assinaturas[role], nome },
      },
    }));
  }

  function handleOperacaoChange(novoCodigo) {
    atualizarFicha(fichaId, (prev) => ({ ...prev, operacao: novoCodigo }));
  }

  async function handleFinalizar() {
    if (!ficha) return;

    if (
      (ficha.status === "finalizada" ||
        ficha.statusAprovacao === "reprovado") &&
      (!ficha.alteracoesFeitas || !ficha.alteracoesFeitas.trim())
    ) {
      alert("⚠️ Preencha o campo 'Alterações Feitas' antes de finalizar.");
      return;
    }

    atualizarFicha(fichaId, {
      status: "finalizada",
      statusAprovacao: "aguardando",
      finalizadaAt: new Date().toISOString(),
    });

    await new Promise((r) => setTimeout(r, 500));
    const success = await exportFicha(ficha, "print-view-root");

    setSuccessModal({
      isOpen: true,
      title: success ? "Sucesso!" : "Erro",
      message: success
        ? "Ficha finalizada com sucesso!"
        : "Erro ao gerar o PDF.",
      type: success ? "success" : "danger",
    });
  }

  function handleApprove(estado) {
    if (estado === "reprovado") {
      setRejectInfo({ id: fichaId });
      return;
    }
    if (estado === "aprovado") {
      setApproveInfo({ id: fichaId });
      return;
    }
  }

  function confirmApprove(reason) {
    if (!approveInfo) return;
    atualizarFicha(approveInfo.id, {
      statusAprovacao: "aprovado",
      motivoAprovacao: reason,
      aprovadoPor: user?.nome || user?.username,
      aprovadoEm: new Date().toISOString(),
      reprovadoPor: "",
      reprovadoEm: "",
      motivoReprovacao: "",
    });
    setApproveInfo(null);
  }

  function confirmReject(reason) {
    if (!rejectInfo) return;
    atualizarFicha(rejectInfo.id, {
      statusAprovacao: "reprovado",
      status: "andamento",
      motivoReprovacao: reason,
      reprovadoPor: user?.nome || user?.username,
      reprovadoEm: new Date().toISOString(),
      aprovadoPor: "",
      aprovadoEm: "",
      alteracoesFeitas: "",
    });
    setRejectInfo(null);
  }

  function getProgress() {
    const total = ficha?.items?.length || 0;
    const done =
      ficha?.items?.filter((i) => i.resultado === "ok" || i.resultado === "na")
        .length || 0;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }
  const operacaoStr = String(ficha?.operacao ?? "");
  const isTaf = operacaoStr === "50";
  const isFoto = operacaoStr === "80";
  const isPainel = String(ficha.operacao) === "10" && !!ficha.tipoPainel;
  const checklistItems = getChecklistItems(ficha.operacao);
  const activeChecklistItems = isPainel
    ? getPainelChecklistItems(ficha.tipoPainel, { incluirVerificacao: false })
    : checklistItems;

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

  return (
    <>
      <div className="app">
        <Header
          ficha={ficha}
          user={user}
          progress={getProgress()}
          onBack={handleBack}
          onApprove={handleApprove}
        />

        <main className="main-content">
          {activeTab === "info" &&
            (!isFoto ? (
              <InfoCard
                ficha={ficha}
                onChange={updateField}
                onOperacaoChange={handleOperacaoChange}
                onTipoPainelChange={handleTipoPainelChange}
              />
            ) : (
              <ConsideracoesPanel
                ficha={ficha}
                onUpdateHeader={updateField}
                onUpdateFotoData={handleUpdateConsideracoes}
              />
            ))}

          {activeTab === "checklist" && (
            <ChecklistTable
              ficha={ficha}
              checklistItems={
                isPainel
                  ? getPainelChecklistItems(ficha.tipoPainel, {
                      incluirVerificacao: false,
                    })
                  : checklistItems
              }
              onToggleMark={updateItemSessionMark}
              onSetResultado={(idx, val, observacao) =>
                updateItemResultado(idx, val, observacao)
              }
              isTaf={isTaf}
              isPainel={isPainel}
              tafData={ficha.tafData}
              onUpdateTaf={handleUpdateTaf}
              readOnly={!sessaoIniciada}
            />
          )}

          {activeTab === "taf" && isTaf && (
            <TafPanel ficha={ficha} onUpdate={handleUpdateTafPanel} />
          )}

          {activeTab === "fotos" && isFoto && (
            <PhotoPanel ficha={ficha} onUpdateFotoData={handleUpdateFotoData} />
          )}

          {activeTab === "sessions" && (
            <>
              <SessoesTrabalhoList fichaId={ficha.dbId} user={user} />
              <ChecklistLogList
                fichaId={ficha.dbId}
                tipoPainel={ficha.tipoPainel}
              />
            </>
          )}

          {activeTab === "notes" && (
            <NotesSection
              ficha={ficha}
              observacoes={ficha.observacoes}
              onChange={(val) => updateField("observacoes", val)}
              onChangeAlteracoes={(val) => updateField("alteracoesFeitas", val)}
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

        <BotaoSessaoTrabalho
          fichaId={ficha.dbId}
          user={user}
          onChange={loadSessoes}
        />
      </div>

      <div style={{ position: "fixed", top: 0, left: 0, zIndex: -9999 }}>
        <PrintView ficha={ficha} />
      </div>

      <ConfirmModal
        isOpen={successModal.isOpen}
        title={successModal.title}
        message={successModal.message}
        type={successModal.type || "success"}
        confirmText="Entendido"
        showCancel={false}
        onConfirm={() => {
          setSuccessModal({ ...successModal, isOpen: false });
          if (successModal.title === "Sucesso!") handleBack();
        }}
      />

      <ApproveModal
        isOpen={!!approveInfo}
        onClose={() => setApproveInfo(null)}
        onConfirm={confirmApprove}
      />

      <RejectModal
        isOpen={!!rejectInfo}
        onClose={() => setRejectInfo(null)}
        onConfirm={confirmReject}
      />
    </>
  );
}
