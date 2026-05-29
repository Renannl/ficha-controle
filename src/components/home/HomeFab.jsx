import { Plus } from "lucide-react";

export default function HomeFab({ onClick }) {
  return (
    <button className="fab" onClick={onClick}>
      <Plus size={26} />
    </button>
  );
}