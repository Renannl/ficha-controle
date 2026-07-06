// apiClient.js
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    // Sessão expirada — opcional: limpar storage e redirecionar
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    return null;
  }

  return response;
}
