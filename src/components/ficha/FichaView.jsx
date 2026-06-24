// src/components/ficha/FichaView.jsx
import Header from "../header/Header";
import InfoCard from "../info/InfoCard";
import ChecklistTable from "../checklist/ChecklistTable";
import SessionsPanel from "../sessions/SessionsPanel";
import NotesSection from "../notes/NotesSection";
import SignatureSection from "../signatures/SignatureSection";
import PrintView from "../print/PrintView";
import TafPanel from "../taf/TafPanel";
import PhotoPanel from "../photoupload/PhotoPanel";
import ConsideracoesPanel from "../consideracoes/ConsideracoesPanel";
import ConfirmModal from "../ConfirmModal";
import ApproveModal from "../ApproveModal";
import RejectModal from "../RejectModal";
import { getChecklistItems } from "../../data/fichaTemplate";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { exportFicha } from "../../services/sharepointService";

export default function FichaView({
  fichas,
  user,
  atualizarFicha,
  getFicha,
  excluirFicha,
  // Origem: "dashboard" | "colecao"
  // Usado para saber para onde voltar
  origem,
}) {
  const { fichaId, id: colecaoId } = useParams();
  const navigate = useNavigate();

  const ficha = getFicha(fichaId) || null;

  const [activeTab, setActiveTab] = useState(ficha?.tafData ? "taf" : "info");
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
  const [rejectInfo, setRejectInfo] = useState(null);
  const [approveInfo, setApproveInfo] = useState(null);

  // ─── Voltar para a origem correta ───
  function handleBack() {
    if (origem === "colecao") {
      navigate(`/colecao/${colecaoId}`);
    } else {
      navigate("/dashboard");
    }
  }

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
    if (user?.role === "admin") return true;
    if (ficha?.userId === user?.username) return true;
    return user?.permissoes?.includes("editar_ficha");
  }

  // ─── Helpers de update ───
  function updateField(field, value) {
    if (!podeEditar()) return;
    atualizarFicha(fichaId, (prev) => ({ ...prev, [field]: value }));
  }

  function updateItem(itemIndex, key, value) {
    atualizarFicha(fichaId, (prev) => {
      const items = [...prev.items];
      items[itemIndex] = { ...items[itemIndex], [key]: value };
      return { ...prev, items };
    });
  }

  function updateItemSessionMark(itemIndex, sessionIndex, value) {
    if (!podeEditar()) return;
    atualizarFicha(fichaId, (prev) => {
      const items = [...prev.items];
      const marks = [...items[itemIndex].sessionMarks];
      marks[sessionIndex] = marks[sessionIndex] === value ? "" : value;
      items[itemIndex] = { ...items[itemIndex], sessionMarks: marks };
      return { ...prev, items };
    });
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
    // mesma lógica do App.jsx
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

  const isTaf = !!ficha?.tafData;
  const isFoto = ficha?.operacao === "80";
  const checklistItems = getChecklistItems(ficha.operacao);

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
              />
            ) : (
              <ConsideracoesPanel
                ficha={ficha}
                onUpdateHeader={updateField}
                onUpdateFotoData={(newData) =>
                  atualizarFicha(ficha.id, {
                    fotoData: { ...ficha.fotoData, ...newData },
                  })
                }
              />
            ))}

          {activeTab === "checklist" && (
            <ChecklistTable
              ficha={ficha}
              checklistItems={checklistItems}
              onToggleMark={updateItemSessionMark}
              onSetResultado={(idx, val) => updateItem(idx, "resultado", val)}
              isTaf={isTaf}
              tafData={ficha.tafData}
              onUpdateTaf={(newData) =>
                atualizarFicha(ficha.id, {
                  tafData: { ...ficha.tafData, ...newData },
                })
              }
            />
          )}

          {activeTab === "taf" && isTaf && (
            <TafPanel
              ficha={ficha}
              onUpdate={(newData) =>
                atualizarFicha(ficha.id, (prev) => ({ ...prev, ...newData }))
              }
            />
          )}

          {activeTab === "fotos" && isFoto && (
            <PhotoPanel
              ficha={ficha}
              onUpdateFotoData={(newData) =>
                atualizarFicha(ficha.id, {
                  fotoData: { ...ficha.fotoData, ...newData },
                })
              }
            />
          )}

          {activeTab === "sessions" && (
            <SessionsPanel sessions={ficha.sessions} onUpdate={updateSession} />
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
      </div>

      {/* PrintView oculto para geração de PDF */}
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
