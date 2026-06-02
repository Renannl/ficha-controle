import NotesHeader from "./NotesHeader";
import NotesDocumentWarning from "./NotesDocumentWarning";
import NotesStatusMessage from "./NotesStatusMessage";
import NotesFields from "./NotesFields";
import NotesFinalizeButton from "./NotesFinalizeButton";

export default function NotesSection(props) {
  const {
    ficha,
    observacoes,
    onChange,
    onChangeAlteracoes,
    isFoto,
    onFinalizar,
  } = props;

  return (
    <div className="notes-section">
      <div className="card">
        <NotesHeader />

        <NotesDocumentWarning />

        <NotesStatusMessage ficha={ficha} />

        <NotesFields
          ficha={ficha}
          observacoes={observacoes}
          onChange={onChange}
          onChangeAlteracoes={onChangeAlteracoes}
        />

        <NotesFinalizeButton isFoto={isFoto} onFinalizar={onFinalizar} />
      </div>
    </div>
  );
}
