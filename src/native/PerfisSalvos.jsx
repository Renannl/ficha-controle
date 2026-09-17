import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import { getRoleColor, getRoleLabel } from "../utils/roleColors";

const SETOR_PESSOA = { admin: "Administrador" };

export function setorDoPerfil(role) {
  return SETOR_PESSOA[role] || getRoleLabel(role);
}

export function Avatar({ perfil, tamanho = 72 }) {
  const iniciais = (perfil.nome || perfil.username || "?")
    .split(/[\s._]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();

  if (perfil.foto) {
    return (
      <img
        className="perfil-avatar"
        src={perfil.foto}
        alt=""
        style={{ width: tamanho, height: tamanho }}
      />
    );
  }
  return (
    <span
      className="perfil-avatar perfil-avatar--iniciais"
      aria-hidden="true"
      style={{
        width: tamanho,
        height: tamanho,
        background: getRoleColor(perfil.role),
        fontSize: Math.round(tamanho * 0.38),
      }}
    >
      {iniciais}
    </span>
  );
}

export default function PerfisSalvos({
  perfis,
  onEscolher,
  onRemover,
  onOutraConta,
}) {
  const [gerenciando, setGerenciando] = useState(false);

  return (
    <div className="perfis-card">
      <div className="perfis-topo">
        <div>
          <h2>Quem vai entrar?</h2>
          <p>Toque no seu perfil e digite a senha.</p>
        </div>
        <button
          type="button"
          className="perfis-gerenciar"
          onClick={() => setGerenciando((v) => !v)}
        >
          {gerenciando ? "Concluir" : "Gerenciar"}
        </button>
      </div>

      <ul className="perfis-lista">
        {perfis.map((p) => (
          <li key={p.username}>
            <button
              type="button"
              className={`perfil-item${gerenciando ? " perfil-item--gerenciando" : ""}`}
              onClick={() => (gerenciando ? onRemover(p) : onEscolher(p))}
              aria-label={
                gerenciando ? `Remover ${p.nome} deste aparelho` : `Entrar como ${p.nome}`
              }
            >
              <span className="perfil-anel">
                <Avatar perfil={p} />
                {gerenciando && (
                  <span className="perfil-remover" aria-hidden="true">
                    <X size={14} strokeWidth={3} />
                  </span>
                )}
              </span>
              <span className="perfil-nome">{p.nome}</span>
              <span className="perfil-setor">{setorDoPerfil(p.role)}</span>
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="perfis-outra" onClick={onOutraConta}>
        <UserPlus size={18} />
        Usar outra conta
      </button>
    </div>
  );
}
