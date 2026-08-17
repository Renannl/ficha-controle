// utils/roleColors.js

export const ROLE_COLORS = {
  admin: "#5b8def", // azul
  montagem: "#f8bc5a", // amarelo
  barramento: "#5969f3", // azul-violeta
  cabeamento: "#4e944e", // verde
  producao: "#8a8f98", // cinza (cargo legado)
};

export const ROLE_LABELS = {
  admin: "Administradores",
  montagem: "Montagem",
  barramento: "Barramento",
  cabeamento: "Cabeamento",
  producao: "Produção",
};

// 🆕 Ordem do fluxo de produção (Montagem → Barramento → Cabeamento)
const ROLE_ORDER = [
  "montagem",
  "barramento",
  "cabeamento",
  "admin",
  "producao",
];

export function getRoleColor(role) {
  return ROLE_COLORS[role] || "#8a8f98"; // fallback cinza
}

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || role || "Outros";
}

export function agruparUsuariosPorCargo(listaUsuarios = []) {
  const grupos = {};
  listaUsuarios.forEach((usuario) => {
    const role = usuario.role || "producao"; // 🆕 fallback para "producao"
    if (!grupos[role]) {
      grupos[role] = {
        role,
        label: getRoleLabel(role),
        color: getRoleColor(role),
        usuarios: [],
      };
    }
    grupos[role].usuarios.push(usuario);
  });

  // 🆕 ordem fixa do fluxo (não alfabética)
  return Object.values(grupos).sort(
    (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role),
  );
}
