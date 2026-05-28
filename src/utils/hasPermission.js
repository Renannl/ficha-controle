export function hasPermission(user, key) {
  if (user?.role === "admin") return true;
  return user?.permissoes?.includes(key);
}
