import { ROLES } from "../../data/users";
import { Moon, Sun, Settings, LogOut } from "lucide-react";

export default function HomeHeader({
  user,
  theme,
  onToggleTheme,
  onOpenAdmin,
  onLogout,
  stats,
}) {
  return (
    <>
      {/* USER BAR */}
      <div className="user-bar">
        <div className="user-info">
          <div className="user-avatar">
            {(user?.nome || "?")[0].toUpperCase()}
          </div>

          <div>
            <div className="user-name">{user?.nome || "Usuário"}</div>

            <div className="user-role">
              {user?.role ? ROLES[user.role] : ""}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="logout-btn" onClick={onToggleTheme}>
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user?.role === "admin" && (
            <button className="logout-btn" onClick={onOpenAdmin}>
              <Settings size={18} />
            </button>
          )}

          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* HEADER */}
      <div className="home-header">
        <div className="home-brand">
          <img src="/ip.png" alt="Logo" className="home-logo-img" />
          <h1>Ficha de Controle</h1>
        </div>

        <div className="home-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.emAndamento}</div>
            <div className="stat-label">Em Andamento</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.concluidas}</div>
            <div className="stat-label">Concluídas</div>
          </div>
        </div>
      </div>
    </>
  );
}