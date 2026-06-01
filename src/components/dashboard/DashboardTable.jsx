import DashboardTableRow from "./DashboardTableRow";

export default function DashboardTable({
  fichas,
  searchTerm,
  setSearchTerm,
  user,
  onApprove,
}) {
  return (
    <div className="dash-section">
      <h3 className="dash-section-h3">Relação de Painéis e Consultas</h3>

      <input
        type="text"
        placeholder="🔍 Buscar por ID, IND ou Nome do Painel..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div
        className="table-responsive"
        style={{
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
            textAlign: "left",
          }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>IND</th>
              <th>Nome/Equipamento</th>
              <th>Progresso</th>
              <th>Status</th>
              <th>Aprovação</th>
            </tr>
          </thead>

          <tbody>
            {fichas.length > 0 ? (
              fichas.map((f) => (
                <DashboardTableRow
                  key={f.id}
                  ficha={f}
                  user={user}
                  onApprove={onApprove}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6}>Nenhum painel encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
