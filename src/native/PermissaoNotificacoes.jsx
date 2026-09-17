import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { isApp } from "./nativeApp";
import {
  estadoPermissao,
  pedirPermissao,
  aoTocarNotificacao,
} from "./notificacoes";

const CHAVE_ADIADO = "notif-permissao-adiada-ate";
const SETE_DIAS = 7 * 24 * 60 * 60 * 1000;

export default function PermissaoNotificacoes() {
  const navigate = useNavigate();
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    if (!isApp) return undefined;
    let ativo = true;
    let desfazer = () => {};

    aoTocarNotificacao(({ link }) => {
      if (link) navigate(link);
    }).then((f) => {
      if (ativo) desfazer = f;
      else f();
    });

    (async () => {
      const estado = await estadoPermissao();
      let adiadoAte = 0;
      try {
        adiadoAte = Number(localStorage.getItem(CHAVE_ADIADO) || 0);
      } catch {
      }
      const podePerguntar =
        estado === "prompt" || estado === "prompt-with-rationale";
      if (ativo && podePerguntar && Date.now() > adiadoAte) setMostrar(true);
    })();

    return () => {
      ativo = false;
      desfazer();
    };
  }, [navigate]);

  if (!mostrar) return null;

  async function permitir() {
    setMostrar(false);
    await pedirPermissao();
  }

  function agoraNao() {
    setMostrar(false);
    try {
      localStorage.setItem(CHAVE_ADIADO, String(Date.now() + SETE_DIAS));
    } catch {
    }
  }

  return (
    <div
      className="perm-notif-fundo"
      role="dialog"
      aria-modal="true"
      aria-labelledby="perm-notif-titulo"
    >
      <div className="perm-notif-card">
        <div className="perm-notif-icone">
          <Bell size={26} />
        </div>
        <h3 id="perm-notif-titulo">Ativar notificações?</h3>
        <p>
          Receba no celular os avisos de aprovação, reprovação e novas fichas
          enquanto o app estiver aberto ou em segundo plano.
        </p>
        <button className="perm-notif-permitir" onClick={permitir}>
          Permitir notificações
        </button>
        <button className="perm-notif-depois" onClick={agoraNao}>
          Agora não
        </button>
      </div>
    </div>
  );
}
