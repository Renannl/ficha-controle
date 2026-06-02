export default function NotesFinalizeButton({
  isFoto,
  onFinalizar,
}) {
  if (!isFoto || !onFinalizar) return null;

  return (
    <div className="notes-finalize">
      <button
        className="btn btn-primary w-full text-lg"
        onClick={onFinalizar}
      >
        Finalizar e Gerar PDF
      </button>
    </div>
  );
}