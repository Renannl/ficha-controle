export default function LoadingState({ message = "Carregando..." }) {
  return (
    <div className="loading-state">
      <div className="loading-spinner"></div>

      <span className="loading-text">{message}</span>
    </div>
  );
}
