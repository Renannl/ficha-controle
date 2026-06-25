import HomeFilters from "./HomeFilters";
import FichaCard from "./FichaCard";
import { FolderOpen, Plus, Calendar } from "lucide-react";

export default function HomeList({
  mode = "fichas",
  colecoes = [],
  fichas = [],
  filteredFichas = [],
  showSearch,
  setShowSearch,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  user,
  listaUsuarios,
  onOpen,
  onDelete,
  onToggleOperador,
  podeGerenciarOperadores,
  activeDropdownFichaId,
  setActiveDropdownFichaId,
  selectedFichas = [],
  toggleFichaSelection,
  onOpenColecao, // ✅ callback vindo do HomeScreen
}) {
  // ──────────────────────────────────────────────
  // MODO: COLEÇÕES
  // ──────────────────────────────────────────────
  if (mode === "colecoes") {
    return (
      <div className="home-list animate-scaleIn">
        {colecoes.length === 0 ? (
          <div className="colecoes-empty">
            <p>Nenhuma coleção criada ainda.</p>
            <small>Use o botão + para criar uma coleção para um cliente.</small>
          </div>
        ) : (
          <div className="colecoes-grid">
            {colecoes.map((col) => {
              const fichasDaCol = fichas.filter((f) => f.colecao_id === col.id);
              const preview = fichasDaCol.slice(0, 2);
              const resto = fichasDaCol.length - preview.length;

              // ── formata a data de criação ──
              const dataCriacao = col.created_at
                ? new Date(col.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : null;

              return (
                <div
                  key={col.id}
                  className="colecao-card"
                  onClick={() => onOpenColecao(col)}
                >
                  <div className="colecao-card-top">
                    <div className="colecao-card-icon">
                      <FolderOpen size={18} />
                    </div>
                    <div className="colecao-card-info">
                      <div className="colecao-card-title">{col.nome}</div>
                      <div className="colecao-card-sub">
                        {col.cliente ?? "Sem cliente"}
                      </div>
                    </div>
                    <div className="colecao-card-badge">
                      {fichasDaCol.length}{" "}
                      {fichasDaCol.length === 1 ? "ficha" : "fichas"}
                    </div>
                  </div>

                  <div className="colecao-preview">
                    {fichasDaCol.length === 0 ? (
                      <div className="colecao-card-empty">
                        <Plus size={13} /> Nenhuma ficha ainda
                      </div>
                    ) : (
                      <>
                        {preview.map((f) => (
                          <div key={f.id} className="preview-ficha">
                            <span className="preview-ficha-dot" />
                            {f.nomeEquipamento ?? f.tipo ?? "Ficha"}
                          </div>
                        ))}
                        {resto > 0 && (
                          <div className="preview-ficha-more">
                            +{resto} ficha{resto > 1 ? "s" : ""}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {dataCriacao && (
                    <div className="colecao-card-date">
                      <Calendar size={11} />
                      Criada em {dataCriacao}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // MODO: FICHAS (dentro de uma coleção)
  // ──────────────────────────────────────────────
  return (
    <div className="home-list animate-scaleIn">
      <HomeFilters
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {filteredFichas.length === 0 ? (
        <div className="fichas-empty">
          Nenhuma ficha encontrada nesta coleção.
        </div>
      ) : (
        filteredFichas.map((ficha, i) => (
          <FichaCard
            key={ficha.id}
            ficha={ficha}
            index={i}
            user={user}
            listaUsuarios={listaUsuarios}
            selected={selectedFichas.includes(ficha.id)} // ✅ seleção para PDF
            selectionOrder={selectedFichas.indexOf(ficha.id) + 1}
            onToggleSelection={toggleFichaSelection}
            onOpen={onOpen}
            onDelete={onDelete}
            onToggleOperador={onToggleOperador}
            podeGerenciarOperadores={podeGerenciarOperadores}
            activeDropdownFichaId={activeDropdownFichaId}
            setActiveDropdownFichaId={setActiveDropdownFichaId}
          />
        ))
      )}
    </div>
  );
}
