import { useState, useMemo, useEffect } from "react";
import ConfirmModal from "../ConfirmModal";
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
import { exportBook } from "../../services/sharepointService";
import { FileInputIcon } from "lucide-react";
import { useColecoes } from "../../hooks/useColecoes";

export default function HomeScreen({
  fichas,
  onNova,
  onOpen,
  onDelete,
  user,
  onLogout,
  theme,
  onToggleTheme,
  onOpenAdmin,
  onApprove,
  listaUsuarios = [],
  onAtualizarOperadores,
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
  const [selectedColecao, setSelectedColecao] = useState(null);
  const [pendingExport, setPendingExport] = useState(null); // ids pendentes

  const { colecoes, criarColecao, deletarColecao } = useColecoes();

  // ── PERMISSIONS ────────────────────────────────
  const podeGerenciar = canManageOperators(user);

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

  const [deleteColecaoId, setDeleteColecaoId] = useState(null);

  function handleDeleteColecao(e, id) {
    e?.stopPropagation?.();
    setDeleteColecaoId(id);
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

  // filtra coleções pelo termo de busca (reaproveita searchTerm)
  const filteredColecoes = useMemo(() => {
    if (!searchTerm) return colecoes;
    const term = searchTerm.toLowerCase();
    return colecoes.filter(
      (c) =>
        c.cliente?.toLowerCase().includes(term) ||
        c.descricao?.toLowerCase().includes(term),
    );
  }, [colecoes, searchTerm]);

  // ✅ Já está correto, só confirme que está assim:
  const handleCreateFicha = (tipo) => {
    if (!selectedColecao?.id) return; // segurança extra
    onNova(tipo, selectedColecao.id);
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

  // Só dispara o export DEPOIS que bookFichas foi commitado e renderizado
  useEffect(() => {
    if (!pendingExport) return;

    // requestAnimationFrame garante que o browser já pintou o DOM novo
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        await exportBook(pendingExport);
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
    onDelete(deleteId);
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

  const handleAbrirColecao = (colecao) => {
    setSelectedColecao(colecao);
    setSelectedFichas([]);
    setSearchTerm("");
    setViewMode("list");
  };

  const handleVoltarColecoes = () => {
    setSelectedColecao(null);
    setSelectedFichas([]);
    setSearchTerm("");
    setViewMode("list");
  };

  // ── RENDER ─────────────────────────────────────
  return (
    <div className="home">
      <div className="home-bg-decoration">
        <div className="login-bg-circle login-bg-circle-1" />
        <div className="login-bg-circle login-bg-circle-2" />
        <div className="login-bg-circle login-bg-circle-3" />
      </div>
      {/* HEADER */}
      <HomeHeader
        user={user}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenAdmin={onOpenAdmin}
        onLogout={onLogout}
        stats={stats}
      />
      {/* VIEW TOGGLE */}
      <HomeViewToggle
        viewMode={viewMode}
        setViewMode={setViewMode}
        toggleRef={toggleRef}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
        selectedColecao={selectedColecao}
      />
      {/* BREADCRUMB — só dentro de coleção no modo list */}
      {selectedColecao && viewMode === "list" && (
        <div className="colecao-breadcrumb">
          <button className="colecao-back-btn" onClick={handleVoltarColecoes}>
            ← Coleções
          </button>
          <span className="colecao-breadcrumb-separator">/</span>
          <span className="colecao-breadcrumb-name">
            {selectedColecao.nome}
          </span>
        </div>
      )}
      {/* CONTENT */}
      <HomeContent
        viewMode={viewMode}
        fichas={fichas}
        fichasDaColecao={fichasDaColecao}
        user={user}
        onApprove={onApprove}
        showNewMenu={showNewMenu}
        mode={mode}
        colecoes={filteredColecoes}
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
        onOpen={onOpen}
        onDelete={handleDelete}
        onDeleteColecao={handleDeleteColecao}
        onToggleOperador={handleToggleOperadorFicha}
        podeGerenciarOperadores={podeGerenciarOperadores}
        activeDropdownFichaId={activeDropdownFichaId}
        setActiveDropdownFichaId={setActiveDropdownFichaId}
        selectedFichas={selectedFichas}
        toggleFichaSelection={toggleFichaSelection}
        onOpenColecao={handleAbrirColecao}
      />
      {/* MODAL EXCLUIR */}
      <ConfirmModal
        isOpen={!!deleteColecaoId}
        title="Excluir Coleção?"
        message="Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDeleteColecao}
        onCancel={() => setDeleteColecaoId(null)}
      />

      {/* BARRA DE SELEÇÃO PDF — só dentro de coleção */}
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
              const fichasBook = fichasDaColecao.filter((f) =>
                selectedFichas.includes(f.id),
              );
              window.dispatchEvent(
                new CustomEvent("abrir-book-pdf", { detail: fichasBook }),
              );
            }}
          >
            <FileInputIcon /> Gerar PDF
          </button>
        </div>
      )}
      <div style={{ position: "absolute", left: "-99999px", top: 0 }}>
        <BookPrintView fichas={bookFichas} />
      </div>

      {/* FAB */}
      <HomeFab onClick={() => setShowNewMenu(true)} />
      <NewFichaMenu
        show={showNewMenu}
        onClose={() => setShowNewMenu(false)}
        onCreate={handleCreateColecao}
        onCreateFicha={handleCreateFicha}
        mode={mode}
        user={user} // ← adicionar
      />
    </div>
  );
}
