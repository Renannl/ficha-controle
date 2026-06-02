import HeaderInfo from "./HeaderInfo";
import HeaderApprovalActions from "./HeaderApprovalActions";
import HeaderProgress from "./HeaderProgress";

export default function Header({ ficha, user, progress, onBack, onApprove }) {
  return (
    <header className="top-header">
      <button className="back-btn" onClick={onBack} title="Voltar">
        ←
      </button>

      <HeaderInfo ficha={ficha} />

      <div className="header-actions">
        <HeaderApprovalActions
          ficha={ficha}
          user={user}
          onApprove={onApprove}
        />

        <HeaderProgress progress={progress} />
      </div>
    </header>
  );
}
