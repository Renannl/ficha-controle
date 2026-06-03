export default function NotesStatusMessage({ ficha }) {
  if (ficha?.statusAprovacao === "reprovado" && ficha?.motivoReprovacao) {
    return (
      <div className="rejection-note">
        <h4>⚠️ Motivo da Reprovação — {ficha.reprovadoPor || "-"}</h4>

        <p>{ficha.motivoReprovacao}</p>
      </div>
    );
  }

  if (ficha?.statusAprovacao === "aprovado") {
    return (
      <div className="approval-note">
        <h4>✅ Ficha Aprovada — {ficha.aprovadoPor || "-"}</h4>

        <p>{ficha.motivoAprovacao}</p>
      </div>
    );
  }

  return null;
}
