import { EXECUTION_PERMISSIONS, MANAGEMENT_PERMISSIONS } from "./permissions";

const ALL_PERMISSIONS = [
  ...EXECUTION_PERMISSIONS,
  ...MANAGEMENT_PERMISSIONS,
].map((p) => p.key);

export function hasPermission(user, key) {
  if (user?.role === "admin") return true;
  return user?.permissoes?.includes(key);
}

export const canManageUsers = (user) =>
  hasPermission(user, "alocar_usuario");

export const canApprove = (user) =>
  hasPermission(user, "aprovar");

export const canEditFicha = (user) =>
  hasPermission(user, "editar_ficha");