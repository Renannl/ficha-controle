import { hasPermission } from "./hasPermission";

export function canManageOperators(user) {
  return user?.role === "admin" || hasPermission(user, "alocar_usuario");
}