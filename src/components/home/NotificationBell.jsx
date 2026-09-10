import { useState } from "react";
import {
  Bell,
  CheckCheck,
  X,
  FolderOpen,
  FileText,
  Zap,
  BadgeCheck,
} from "lucide-react";
import { useNotificacoes } from "../../hooks/useNotificacoes";
import { useNavigate } from "react-router-dom";

function IconeNotificacao({ tipo }) {
  const size = 16;
  switch (tipo) {
    case "aprovacao":
      return <BadgeCheck size={size} className="notif-icone notif-icone--ok" />;
    case "reprovacao":
      return <X size={size} className="notif-icone notif-icone--erro" />;
    case "ficha":
      return <FileText size={size} className="notif-icone notif-icone--info" />;
    case "colecao":
      return (
        <FolderOpen size={size} className="notif-icone notif-icone--info" />
      );
    default:
      return <Zap size={size} className="notif-icone notif-icone--info" />;
  }
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [aberto, setAberto] = useState(false);
  const { notificacoes, naoLidas, marcarLida, marcarTodasLidas } =
    useNotificacoes();

  function handleClickNotificacao(n) {
    marcarLida(n.id);
    if (n.link) {
      navigate(n.link);
    }
    setAberto(false);
  }

  return (
    <div className="notif-container">
      <button
        className={`notif-bell ${naoLidas > 0 ? "notif-bell--tem-aviso" : ""}`}
        onClick={() => setAberto((v) => !v)}
        title="Notificações"
      >
        <Bell size={18} />
        {naoLidas > 0 && <span className="notif-badge">{naoLidas}</span>}
      </button>

      {aberto && (
        <>
          <div className="notif-overlay" onClick={() => setAberto(false)} />
          <div className="notif-dropdown">
            <div className="notif-dropdown-header">
              <h4>Notificações</h4>
              {naoLidas > 0 && (
                <button
                  className="notif-marcar-todas"
                  onClick={() => marcarTodasLidas()}
                  title="Marcar todas como lidas"
                >
                  <CheckCheck size={14} /> Marcar todas
                </button>
              )}
            </div>

            <div className="notif-lista">
              {notificacoes.length === 0 ? (
                <p className="notif-vazio">Nenhuma notificação.</p>
              ) : (
                notificacoes.map((n) => (
                  <button
                    key={n.id}
                    className={`notif-item ${n.lida ? "" : "notif-item--nova"}`}
                    onClick={() => handleClickNotificacao(n)}
                  >
                    <IconeNotificacao tipo={n.tipo} />
                    <div className="notif-item-info">
                      <span className="notif-item-titulo">{n.titulo}</span>
                      <span className="notif-item-msg">{n.mensagem}</span>
                      <span className="notif-item-data">
                        {new Date(n.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {!n.lida && <span className="notif-ponto" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
