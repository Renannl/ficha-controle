export default function DashboardHeader({ total }) {
  return (
    <div className="dash-title-row">
      <h2 className="dash-title">Dashboard</h2>
      <span className="dash-subtitle">
        {total} ficha{total !== 1 ? "s" : ""} registrada
        {total !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
