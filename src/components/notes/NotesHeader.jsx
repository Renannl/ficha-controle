import { StickyNote } from "lucide-react";

export default function NotesHeader() {
  return (
    <div className="section-header">
      <div className="section-icon">
        <StickyNote size={18} />
      </div>

      <div>
        <h2>Observações</h2>
        <p>Anotações gerais sobre a execução</p>
      </div>
    </div>
  );
}
