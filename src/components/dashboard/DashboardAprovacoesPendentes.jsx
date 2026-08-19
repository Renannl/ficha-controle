export default function DashboardAprovacoesPendentes({ fichas, user, onApprove }) {
  if (!fichas?.length) return null;

  const podeAprovar = user?.permissoes?.includes("aprovar");
  const podeRejeitar = user?.permissoes?.includes("rejeitar");

  return (
    <div className="dash-section">
      <h3 className="dash-section-h3">⏳ Aguardando Aprovação ({fichas.length})</h3>
      <div className="dash-aprov-pendente-list">
        {fichas.map((f) => (
          <div key={f.id} className="dash-aprov-pendente-item">
            <div className="dash-aprov-pendente-info">
              <span className="dash-aprov-pendente-nome">{f.nome}</span>
              <span className="dash-aprov-pendente-meta">{f.numeroInd} · {f.codigo}</span>
            </div>
            {(podeAprovar || podeRejeitar) && onApprove && (
              <div style={{ display: "flex", gap: 6 }}>
                {podeAprovar && (
                  <button className="dash-aprov-btn aprovar" onClick={() => onApprove(f.id, "aprovado")}>
                    ✓ Aprovar
                  </button>
                )}
                {podeRejeitar && (
                  <button className="dash-aprov-btn reprovar" onClick={() => onApprove(f.id, "reprovado")}>
                    ✗ Reprovar
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
