import { useState, useEffect } from "react";
import { ROLES } from "../../data/users";
import PhotoBank from "../PhotoBank";
import Dashboard from "../Dashboard";
import ConfirmModal from "../ConfirmModal";
import FichaCard from "./FichaCard";
import { useFichasFilter } from "../../hooks/useFichasFilter";
import { useLocalStorageState } from "../../hooks/useLocalStorageState";
import { useViewModeDrag } from "../../hooks/useViewModeDrag";
import { useOperators } from "../../hooks/useOperators";
import { canManageOperators } from "../../utils/operators";
import { getAvailableOperations } from "../../utils/operations";

import {
  Moon,
  Sun,
  Settings,
  LogOut,
  LayoutList,
  Images,
  BarChart3,
  ClipboardList,
  Search,
  X,
  Zap,
  Camera,
  Plus,
} from "lucide-react";

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
  // STATE

  const [viewMode, setViewMode] = useLocalStorageState("homeViewMode", "list");

  const [showNewMenu, setShowNewMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [activeDropdownFichaId, setActiveDropdownFichaId] = useState(null);

  // PERMISSIONS
  const podeGerenciar = canManageOperators(user);

  // HOOKS
  const {
    toggleRef,
    dragOffset,
    isDragging,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useViewModeDrag(setViewMode);

  const { handleToggleOperadorFicha, podeGerenciarOperadores } = useOperators({
    user,
    onAtualizarOperadores,
    podeGerenciar,
  });

  // LOCAL STORAGE SYNC
  const [filterStatus, setFilterStatus] = useLocalStorageState(
    "homeFilterStatus",
    "all",
  );

  const [filterType, setFilterType] = useLocalStorageState(
    "homeFilterType",
    "all",
  );

  useEffect(() => {
    const validStatus = [
      "all",
      "progress",
      "done",
      "waiting",
      "approved",
      "rejected",
      "empty",
    ];

    const validTypes = ["all", "taf", "controle", "foto"];

    if (!validStatus.includes(filterStatus)) {
      setFilterStatus("all");
    }

    if (!validTypes.includes(filterType)) {
      setFilterType("all");
    }
  }, []);

  // DATA
  const availableOps = getAvailableOperations(user);

  const { filteredFichas, stats } = useFichasFilter({
    fichas,
    filterStatus,
    filterType,
    searchTerm,
  });

  // ACTIONS
  function handleDelete(e, id) {
    e.stopPropagation();
    setDeleteId(id);
  }

  const confirmDelete = () => {
    if (!deleteId) return;
    onDelete(deleteId);
    setDeleteId(null);
  };

  const handleCreateNew = (code) => {
    setShowNewMenu(false);
    onNova(code);
  };

  // RENDER
  return (
    <div className="home">
      <div className="home-bg-decoration">
        <div className="login-bg-circle login-bg-circle-1" />
        <div className="login-bg-circle login-bg-circle-2" />
        <div className="login-bg-circle login-bg-circle-3" />
      </div>

      {/* USER BAR */}
      <div className="user-bar">
        <div className="user-info">
          <div className="user-avatar">
            {(user?.nome || "?")[0].toUpperCase()}
          </div>
          <div>
            <div className="user-name">{user?.nome || "Usuário"}</div>
            <div className="user-role">
              {user?.role ? ROLES[user.role] : ""}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="logout-btn" onClick={onToggleTheme}>
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user?.role === "admin" && (
            <button className="logout-btn" onClick={onOpenAdmin}>
              <Settings size={18} />
            </button>
          )}

          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* HEADER */}
      <div className="home-header">
        <div className="home-brand">
          <img src="/ip.png" alt="Logo" className="home-logo-img" />
          <h1>Ficha de Controle</h1>
        </div>

        <div className="home-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.emAndamento}</div>
            <div className="stat-label">Em Andamento</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.concluidas}</div>
            <div className="stat-label">Concluídas</div>
          </div>
        </div>
      </div>

      {/* VIEW TOGGLE */}
      <div
        className="home-view-toggle"
        ref={toggleRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="view-toggle-slider"
          style={{
            left:
              viewMode === "list"
                ? "var(--toggle-pad)"
                : viewMode === "gallery"
                  ? "calc(33.33% + var(--toggle-pad))"
                  : "calc(66.66% + var(--toggle-pad))",
          }}
        />

        <button
          onClick={() => setViewMode("list")}
          className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
        >
          <LayoutList size={16} /> Relatórios
        </button>

        <button
          onClick={() => setViewMode("gallery")}
          className={`view-toggle-btn ${viewMode === "gallery" ? "active" : ""}`}
        >
          <Images size={16} /> Fotos
        </button>

        <button
          onClick={() => setViewMode("dashboard")}
          className={`view-toggle-btn ${viewMode === "dashboard" ? "active" : ""}`}
        >
          <BarChart3 size={16} /> Métricas
        </button>
      </div>

      {/* CONTENT */}
      {viewMode === "dashboard" ? (
        <div style={{ padding: "16px", paddingBottom: "100px" }}>
          <Dashboard fichas={fichas} user={user} onApprove={onApprove} />
        </div>
      ) : viewMode === "gallery" ? (
        <PhotoBank fichas={fichas} />
      ) : (
        <>
          {/* Lista */}
          {fichas.length === 0 && !showNewMenu ? (
            <div className="home-empty" style={{ paddingBottom: 120 }}>
              <div className="empty-icon">
                <ClipboardList size={42} strokeWidth={1.8} />
              </div>

              <p>Nenhuma ficha criada ainda. Toque no botão + para começar.</p>
            </div>
          ) : (
            <div className="home-list animate-scaleIn">
              <div
                className="home-list-header flex items-center justify-between mb-2"
                style={{
                  flexWrap: "wrap",
                  gap: "8px",
                  gridColumn: "1 / -1",
                  width: "100%",
                }}
              >
                <div className="flex items-center gap-2">
                  {!showSearch && (
                    <div
                      className="home-list-title"
                      style={{ marginBottom: 0 }}
                    >
                      Fichas Recentes
                    </div>
                  )}

                  <div
                    className={`search-container ${showSearch ? "active" : ""}`}
                  >
                    <button
                      className="search-toggle-btn"
                      onClick={() => {
                        setShowSearch((prev) => !prev);

                        if (showSearch) {
                          setSearchTerm("");
                        }
                      }}
                    >
                      {showSearch ? <X size={18} /> : <Search size={18} />}
                    </button>

                    {showSearch && (
                      <input
                        className="search-input animate-slideInRight"
                        type="text"
                        placeholder="Nome ou código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                      />
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* Filtro Tipo */}
                  <select
                    className="text-xs font-semibold"
                    style={{
                      background:
                        "var(--blue-glow) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%233CA3AB' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\") no-repeat right 8px center",
                      border: "1px solid var(--blue-accent)",
                      borderRadius: "var(--radius-xs)",
                      padding: "6px 24px 6px 10px",
                      color: "var(--blue-primary)",
                      outline: "none",
                      cursor: "pointer",
                      appearance: "none",
                      WebkitAppearance: "none",
                    }}
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="taf">TAF</option>
                    <option value="controle">Controle</option>
                    <option value="foto">Fotos</option>
                  </select>

                  {/* Filtro Status */}
                  <select
                    className="text-xs font-semibold"
                    style={{
                      background:
                        "var(--bg-elevated) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237A8FA6' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\") no-repeat right 8px center",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-xs)",
                      padding: "6px 24px 6px 10px",
                      color: "var(--text-secondary)",
                      outline: "none",
                      cursor: "pointer",
                      appearance: "none",
                      WebkitAppearance: "none",
                    }}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Todos Status</option>
                    <option value="progress">🟡 Andamento</option>
                    <option value="done">🔵 Preenchida</option>
                    <option value="waiting">🟠 Aguardando</option>
                    <option value="approved">🟢 Aprovada</option>
                    <option value="rejected">🔴 Reprovada</option>
                    <option value="empty">⚪ Nova</option>
                  </select>
                </div>
              </div>

              {filteredFichas.length === 0 ? (
                <div
                  className="text-center py-12 opacity-60 text-sm card-glow-none"
                  style={{
                    padding: "20px 20px",
                    background: "var(--bg-card)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  Nenhuma ficha encontrada para estes filtros.
                </div>
              ) : (
                filteredFichas.map((ficha, i) => (
                  <FichaCard
                    key={ficha.id}
                    ficha={ficha}
                    index={i}
                    user={user}
                    listaUsuarios={listaUsuarios}
                    onOpen={onOpen}
                    onDelete={handleDelete}
                    onToggleOperador={handleToggleOperadorFicha}
                    podeGerenciarOperadores={podeGerenciarOperadores}
                    activeDropdownFichaId={activeDropdownFichaId}
                    setActiveDropdownFichaId={setActiveDropdownFichaId}
                  />
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Excluir Ficha?"
        message="Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* FAB */}
      <button className="fab" onClick={() => setShowNewMenu(true)}>
        <Plus size={26} />
      </button>

      {showNewMenu && (
        <div
          className="new-ficha-overlay animate-fadeIn"
          onClick={() => setShowNewMenu(false)}
        >
          <div
            className="new-ficha-menu animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="new-ficha-menu-header">
              <h3>Selecione o Modelo</h3>
              <p>Escolha qual ficha deseja iniciar agora</p>
            </div>

            <div className="new-ficha-options">
              {availableOps.map((op) => (
                <button
                  key={op.codigo}
                  className="new-ficha-opt-btn"
                  onClick={() => handleCreateNew(op.codigo)}
                >
                  <div className="opt-icon">
                    {op.codigo === "50" ? (
                      <Zap size={22} />
                    ) : op.codigo === "80" ? (
                      <Camera size={22} />
                    ) : (
                      <ClipboardList size={22} />
                    )}
                  </div>

                  <div className="opt-text">
                    <div className="opt-title">{op.nome}</div>
                    <div className="opt-desc">{op.objetivo}</div>
                  </div>
                </button>
              ))}
            </div>

            <button
              className="btn btn-ghost w-full mt-3"
              onClick={() => setShowNewMenu(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
