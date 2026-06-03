export default function TafObservacoes({ observacoes, onChange }) {
  return (
    <>
      <div className="taf-section-title">OBSERVAÇÕES FINAIS</div>

      <div className="taf-input-group" style={{ padding: "0 16px" }}>
        <textarea
          value={observacoes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Registre aqui qualquer detalhe relevante dos ensaios..."
          style={{
            width: "100%",
            minHeight: "80px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "10px",
            color: "var(--text-primary)",
            fontFamily: "inherit",
          }}
        />
      </div>
    </>
  );
}
