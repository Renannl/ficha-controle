// utils/roleColors.js

export const ROLE_COLORS = {
  admin: "#5b8def",       // azul
  montagem: "#f8bc5a",    // amarelo
  cabeamento: "#4e944e",  // verde
  barramento: "#5969f3",  // azul-violeta
};

export const ROLE_LABELS = {
  admin: "Administradores",
  montagem: "Montagem",
  cabeamento: "Cabeamento",
  barramento: "Barramento",
};

export function getRoleColor(role) {
  return ROLE_COLORS[role] || "#8a8f98"; // fallback cinza hex
}

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || "Outros";
}

export function agruparUsuariosPorCargo(listaUsuarios = []) {
  const grupos = {};
  listaUsuarios.forEach((usuario) => {
    const role = usuario.role || "outros";
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
  return Object.values(grupos).sort((a, b) => a.label.localeCompare(b.label));
}
