export default function HeaderProgress({ progress }) {
  return (
    <div className="header-progress">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <span>{progress}%</span>
    </div>
  );
}
