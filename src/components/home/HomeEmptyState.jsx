import { ClipboardList } from "lucide-react";

export default function HomeEmptyState() {
  return (
    <div className="home-empty" style={{ paddingBottom: 120 }}>
      <div className="empty-icon">
        <ClipboardList size={42} strokeWidth={1.8} />
      </div>

      <p>Nenhuma ficha criada ainda. Toque no botão + para começar.</p>
    </div>
  );
}
