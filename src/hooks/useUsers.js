import { useEffect, useState } from "react";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(
          "[useUsers] Erro ao buscar usuários:",
          response.status,
          text,
        );
        setUsers([]);
        return;
      }

      const data = await response.json();

      const roleOrder = {
        admin: 1,
        corretor: 2,
        projetos: 3,
        producao: 4,
      };

      const sortedUsers = [...data].sort((a, b) => {
        if (a.username === "master") return -1;
        if (b.username === "master") return 1;

        const roleA = roleOrder[a.role] || 999;
        const roleB = roleOrder[b.role] || 999;

        if (roleA !== roleB) {
          return roleA - roleB;
        }

        const nomeA = (a.nome || a.username || "").toLowerCase();
        const nomeB = (b.nome || b.username || "").toLowerCase();

        return nomeA.localeCompare(nomeB, "pt-BR");
      });

      setUsers(sortedUsers);
    } catch (err) {
      console.error("[useUsers] Erro de rede:", err);
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(userId, payload) {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      console.error(
        "[useUsers] Erro ao atualizar usuário:",
        response.status,
        text,
      );
      throw new Error("Erro ao atualizar usuário");
    }

    await loadUsers();
  }

  return {
    users,
    loading,
    loadUsers,
    updateUser,
  };
}
