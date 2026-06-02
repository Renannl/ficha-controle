import { NOTA_DOCUMENTOS } from "../../data/fichaTemplate";

export default function NotesDocumentWarning() {
  return (
    <div className="notes-info">
      <strong style={{ color: "var(--amber)" }}>
        ⚠ Nota:
      </strong>{" "}
      {NOTA_DOCUMENTOS}
    </div>
  );
}