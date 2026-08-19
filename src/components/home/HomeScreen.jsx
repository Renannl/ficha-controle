import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../buttons/ConfirmModal";
import { useFichasFilter } from "../../hooks/useFichasFilter";
import { useLocalStorageState } from "../../hooks/useLocalStorageState";
import { useViewModeDrag } from "../../hooks/useViewModeDrag";
import { useOperators } from "../../hooks/useOperators";
import { canManageOperators } from "../../utils/operators";
import { canGeneratePdf } from "../../utils/hasPermission";
import NewFichaMenu from "./NewFichaMenu";
import HomeViewToggle from "./HomeViewToggle";
import HomeHeader from "./HomeHeader";
import HomeContent from "./HomeContent";
import HomeFab from "./HomeFab";
import { useHomeFilters } from "../../hooks/useHomeFilters";
import BookPrintView from "../print/BookPrintView";
import {
  generateFichaPdf,
  generateBookPdf,
} from "../../services/exportPdfEngine";
import { FileInputIcon } from "lucide-react";
import { useColecoes } from "../../hooks/useColecoes";
import ColecaoArquivosTab from "../colecao/ColecaoArquivosTab";
import ColecaoPastasTab from "../colecao/ColecaoPastasTab";

export default function HomeScreen({
  fichas,
  onFichasAtualizadas,
  onNova,
  onOpen,
  onDelete,
  onAtualizarOperadores,
  onAtualizarFicha,
  user,
  onLogout,
  theme,
  onToggleTheme,
  onOpenAdmin,
  listaUsuarios = []
}) {
  // ── STATE ──────────────────────────────────────
  const [viewMode, setViewMode] = useLocalStorageState("homeViewMode", "list");
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [activeDropdownFichaId, setActiveDropdownFichaId] = useState(null);
  const [bookFichas, setBookFichas] = useState([]);
  const [selectedFichas, setSelectedFichas] = useState([]);
  const [pendingExport, setPendingExport] = useState(null);
  const [deleteColecaoId, setDeleteColecaoId] = useState(null);
  const [abaColecao, setAbaColecao] = useState("fichas");

  const navigate = useNavigate();
  const { colecaoId } = useParams();

  const { colecoes, criarColecao, deletarColecao, recarregarColecoes } =
    useColecoes();

  // ── PERMISSIONS ────────────────────────────────
  const podeGerenciar = canManageOperators(user);

  // 🆕 selectedColecao derivada da URL (sem useState duplicado)
  const selectedColecao = useMemo(() => {
    if (!colecaoId) return null;
    return colecoes.find((c) => String(c.id) === String(colecaoId)) || null;
  }, [colecaoId, colecoes]);

  // ── FICHAS DA COLEÇÃO ABERTA ───────────────────
  const fichasDaColecao = useMemo(() => {
    if (!selectedColecao) return [];
    return fichas.filter((f) => f.colecao_id === selectedColecao.id);
  }, [fichas, selectedColecao]);

  // ── HOOKS ──────────────────────────────────────
  const { toggleRef, handleTouchStart, handleTouchMove, handleTouchEnd } =
    useViewModeDrag(setViewMode);

  const { handleToggleOperadorFicha, podeGerenciarOperadores } = useOperators({
    user,
    onAtualizarOperadores,
    podeGerenciar,
  });

  const handleColecaoImportada = async (resultado) => {
    await recarregarColecoes();
    await onFichasAtualizadas?.();
  };

  function handleDeleteColecao(e, id) {
    e?.stopPropagation?.();
    setDeleteColecaoId(id);
  }

  function handleApprove(fichaId, estado) {
    if (!onAtualizarFicha) return;
    const agora = new Date().toISOString();
    const autor = user?.nome || user?.username;

    if (estado === "aprovado") {
      onAtualizarFicha(fichaId, {
        statusAprovacao: "aprovado",
        aprovadoPor: autor,
        aprovadoEm: agora,
      });
    } else {
      onAtualizarFicha(fichaId, {
        statusAprovacao: "reprovado",
        status: "andamento",
        reprovadoPor: autor,
        reprovadoEm: agora,
      });
    }
  }

  const confirmDeleteColecao = async () => {
    if (!deleteColecaoId) return;
    try {
      await deletarColecao(deleteColecaoId);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Erro ao excluir coleção");
    } finally {
      setDeleteColecaoId(null);
    }
  };

  // filtra coleções pelo termo de busca
  const filteredColecoes = useMemo(() => {
    if (!searchTerm) return colecoes;
    const term = searchTerm.toLowerCase();
    return colecoes.filter(
      (c) =>
        c.cliente?.toLowerCase().includes(term) ||
        c.descricao?.toLowerCase().includes(term),
    );
  }, [colecoes, searchTerm]);

  // ── NAVEGAÇÃO (única versão, via URL) ──────────
  const handleAbrirColecao = (colecao) => {
    navigate(`/colecao/${colecao.id}`);
    setAbaColecao("fichas"); // 🆕 volta pra Fichas ao abrir nova coleção
    setSelectedFichas([]);
    setSearchTerm("");
    setViewMode("list");
  };

  const handleVoltarColecoes = () => {
    navigate("/dashboard");
    setAbaColecao("fichas"); // 🆕
    setSelectedFichas([]);
    setSearchTerm("");
    setViewMode("list");
  };

  const handleCreateFicha = (
    tipo,
    fichaProducao = null,
    tipoFotografico = null,
  ) => {
    if (!selectedColecao?.id) return;
    onNova(tipo, selectedColecao.id, fichaProducao, tipoFotografico);
    setShowNewMenu(false);
  };

  useEffect(() => {
    const handler = (e) => {
      const fichasSelecionadas = e.detail;
      setBookFichas(fichasSelecionadas);
      setPendingExport(fichasSelecionadas.map((f) => f.dbId ?? f.id));
    };
    window.addEventListener("abrir-book-pdf", handler);
    return () => window.removeEventListener("abrir-book-pdf", handler);
  }, []);

  useEffect(() => {
    if (!pendingExport) return;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        await generateBookPdf(pendingExport);
        setPendingExport(null);
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [bookFichas, pendingExport]);

  // ── FILTERS ────────────────────────────────────
  const { filterStatus, setFilterStatus, filterType, setFilterType } =
    useHomeFilters();

  const { filteredFichas, stats } = useFichasFilter({
    fichas: selectedColecao ? fichasDaColecao : fichas,
    filterStatus,
    filterType,
    searchTerm,
  });

  const mode = selectedColecao ? "fichas" : "colecoes";

  // ── ACTIONS ────────────────────────────────────
  function handleDelete(e, id) {
    e?.stopPropagation?.();
    setDeleteId(id);
  }

  const confirmDelete = () => {
    if (!deleteId) return;
    onDelete(null, deleteId);
    setDeleteId(null);
  };

  const handleCreateColecao = async (payload) => {
    try {
      await criarColecao(payload);
      setShowNewMenu(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao criar coleção");
    }
  };

  const toggleFichaSelection = (id) => {
    setSelectedFichas((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  // 🆕 onOpen agora repassa o colecaoId (se estiver dentro de uma coleção)
  const handleOpenFicha = (id) => {
    onOpen(id, selectedColecao?.id ?? null);
  };

  // ── RENDER ─────────────────────────────────────
  return (
    <div className="home">
      <div className="home-bg-decoration">
        <div className="login-bg-circle login-bg-circle-1" />
        <div className="login-bg-circle login-bg-circle-2" />
        <div className="login-bg-circle login-bg-circle-3" />
      </div>

      <HomeHeader
        user={user}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenAdmin={onOpenAdmin}
        onLogout={onLogout}
        stats={stats}
      />

      <HomeViewToggle
        viewMode={viewMode}
        setViewMode={setViewMode}
        toggleRef={toggleRef}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
        selectedColecao={selectedColecao}
      />

      {selectedColecao && viewMode === "list" && (
        <div className="colecao-breadcrumb">
          <button className="colecao-back-btn" onClick={handleVoltarColecoes}>
            ← Coleções
          </button>
          <span className="colecao-breadcrumb-separator">/</span>
          <span className="colecao-breadcrumb-name">
            {selectedColecao.nome}
          </span>

          <div className="colecao-tabs">
            <button
              className={
                abaColecao === "fichas" ? "colecao-tab ativa" : "colecao-tab"
              }
              onClick={() => setAbaColecao("fichas")}
            >
              Fichas
            </button>
            <button
              className={
                abaColecao === "pastas" ? "colecao-tab ativa" : "colecao-tab"
              }
              onClick={() => setAbaColecao("pastas")}
            >
              Pastas
            </button>
            <button
              className={
                abaColecao === "arquivos" ? "colecao-tab ativa" : "colecao-tab"
              }
              onClick={() => setAbaColecao("arquivos")}
            >
              Arquivos
            </button>
          </div>
        </div>
      )}

      {abaColecao === "fichas" && (
        <HomeContent
          viewMode={viewMode}
          fichas={fichas}
          fichasDaColecao={fichasDaColecao}
          user={user}
          showNewMenu={showNewMenu}
          mode={mode}
          colecoes={filteredColecoes}
          onApprove={handleApprove}
          filteredFichas={filteredFichas}
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          listaUsuarios={listaUsuarios}
          onOpen={handleOpenFicha}
          onDelete={handleDelete}
          onDeleteColecao={handleDeleteColecao}
          onToggleOperador={handleToggleOperadorFicha}
          podeGerenciarOperadores={podeGerenciarOperadores}
          activeDropdownFichaId={activeDropdownFichaId}
          setActiveDropdownFichaId={setActiveDropdownFichaId}
          selectedFichas={selectedFichas}
          toggleFichaSelection={toggleFichaSelection}
          onOpenColecao={handleAbrirColecao}
          onColecaoImportada={handleColecaoImportada}
        />
      )}

      {abaColecao === "arquivos" && (
        <ColecaoArquivosTab colecaoId={selectedColecao.id} />
      )}

      {abaColecao === "pastas" && (
        <ColecaoPastasTab colecaoId={selectedColecao.id} />
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Excluir Ficha?"
        message="Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmModal
        isOpen={!!deleteColecaoId}
        title="Excluir Coleção?"
        message="Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDeleteColecao}
        onCancel={() => setDeleteColecaoId(null)}
      />

      {canGeneratePdf(user) && selectedFichas.length > 0 && selectedColecao && (
        <div className="selection-bar">
          <div className="selection-info">
            <span className="selection-count">{selectedFichas.length}</span>
            <div>
              <div className="selection-title">Book PDF</div>
              <div className="selection-subtitle">fichas selecionadas</div>
            </div>
          </div>
          <button
            className="generate-pdf-btn"
            onClick={() => {
              const fichasBook = selectedFichas
                .map((id) => fichasDaColecao.find((f) => f.dbId === id))
                .filter(Boolean);

              window.dispatchEvent(
                new CustomEvent("abrir-book-pdf", { detail: fichasBook }),
              );
            }}
          >
            <FileInputIcon /> Gerar PDF
          </button>
        </div>
      )}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <BookPrintView fichas={bookFichas} />
      </div>

      <HomeFab onClick={() => setShowNewMenu(true)} />
      <NewFichaMenu
        show={showNewMenu}
        onClose={() => setShowNewMenu(false)}
        onCreate={handleCreateColecao}
        onCreateFicha={handleCreateFicha}
        mode={mode}
        user={user}
        onColecaoImportada={handleColecaoImportada}
        fichasDaColecao={fichasDaColecao}
      />
    </div>
  );
}
