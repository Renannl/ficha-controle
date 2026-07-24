import { useState, useEffect, useRef, useCallback } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const isManualLogoutRef = useRef(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // 🔧 authFetch memoizado — não recria a cada render
  const authFetch = useCallback(async (url, options = {}) => {
    if (isManualLogoutRef.current) return null;

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
      if (!isManualLogoutRef.current) logout(true);
      return null;
    }

    return response;
  }, []); // sem dependências instáveis — token é lido direto do localStorage

  // 🔧 perfil também memoizado
  const perfil = useCallback(async () => {
    try {
      const response = await authFetch(
        `${import.meta.env.VITE_API_URL}/perfil`,
      );
      if (!response) return null;

      const data = await response.json();

      if (data.user) {
        // 🔧 só atualiza se realmente mudou (evita loop de referência nova)
        setUser((prev) =>
          JSON.stringify(prev) === JSON.stringify(data.user)
            ? prev
            : data.user,
        );
      }

      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [authFetch]);

  // 🔧 usa isAuthenticated (bool) como dependência, não o objeto user
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!isAuthenticated) return;

    perfil();
    const interval = setInterval(() => perfil(), 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, perfil]); // 🔧 não depende mais de "user" (objeto instável)

  async function login(username, password) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return false;
      }

      isManualLogoutRef.current = false;
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      return true;
    } catch (err) {
      console.error(err);
      alert("Erro conexão backend");
      return false;
    }
  }

  function logout(showAlert = false) {
    isManualLogoutRef.current = true;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);

    if (showAlert) {
      alert("Sessão expirada");
    }

    window.location.href = "/login";
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    authFetch,
  };
}
