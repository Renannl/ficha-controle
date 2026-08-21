import { TrendingUp } from "lucide-react";

const MESES = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr",
  "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
};

export default function DashboardProducaoMensal({ producaoMensal }) {
  if (!producaoMensal?.length) return null;

  const max = Math.max(...producaoMensal.map((p) => p.qtd), 1);

  return (
    <div className="dash-section">
      <h3 className="dash-section-h3">
        <TrendingUp size={16} /> Produção Mensal
      </h3>

      <div className="dash-prod-chart">
        {producaoMensal.map((p) => {
          const [ano, mes] = p.mes.split("-");
          return (
            <div key={p.mes} className="dash-prod-col">
              <span className="dash-prod-count">{p.qtd}</span>
              <div
                className="dash-prod-bar"
                style={{ height: `${Math.max((p.qtd / max) * 100, 4)}%` }}
              />
              <span className="dash-prod-label">{MESES[mes] || mes}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
