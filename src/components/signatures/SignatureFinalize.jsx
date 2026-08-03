export default function SignatureFinalize({ onFinalizar }) {
  return (
    <div className="finalize-section animate-slideUp">
      <div className="finalize-card">
        <div className="finalize-header">
          <h3>Finalizar Ficha</h3>
          <p>Conclua a operação para enviar para aprovação</p>
        </div>

        <button
          className="btn btn-primary btn-lg finalize-btn"
          onClick={onFinalizar}
        >
          <span className="btn-icon">✅</span>
          Finalizar Ficha
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
          Todos os campos e assinaturas obrigatórias precisam estar preenchidos.
        </p>
      </div>
    </div>
  );
}
