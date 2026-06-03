export default function SignatureFinalize({ onFinalizar }) {
  return (
    <div className="finalize-section animate-slideUp">
      <div className="finalize-card">
        <div className="finalize-header">
          <h3>Finalizar Ficha</h3>

          <p>Conclua a operação e gere o relatório oficial (PDF)</p>
        </div>

        <button
          className="btn btn-primary btn-lg finalize-btn"
          onClick={onFinalizar}
        >
          <span className="btn-icon">💾</span>
          Finalizar e Gerar PDF
        </button>

        <p
          className="finalize-note"
          style={{
            fontSize: "11px",
            textAlign: "center",
            opacity: 0.6,
            marginTop: "8px",
          }}
        >
          O relatório será gerado com os dados preenchidos até agora.
        </p>
      </div>
    </div>
  );
}
