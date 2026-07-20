// src/hooks/useSessoesTrabalho.js
import { useEffect, useState, useCallback } from "react";
import { authFetch } from "../services/apiClient";

export function useSessoesTrabalho(fichaId) {
  const [sessoes, setSessoes] = useState([]);
  const [totalSegundos, setTotalSegundos] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadSessoes = useCallback(async () => {
    if (!fichaId) return;
    setLoading(true);
    try {
      const response = await authFetch(`/fichas/${fichaId}/sessoes`);
      if (!response || !response.ok) {
        setSessoes([]);
        setTotalSegundos(0);
        return;
      }
      const data = await response.json();
      setSessoes(data.sessoes || []);
      setTotalSegundos(data.totalSegundos || 0);
    } catch (err) {
      console.error("[useSessoesTrabalho] Erro ao buscar sessões:", err);
      setSessoes([]);
    } finally {
      setLoading(false);
    }
  }, [fichaId]);

  useEffect(() => {
    loadSessoes();
  }, [loadSessoes]);

  const updateSessao = useCallback(
    async (sessaoId, payload) => {
      const response = await authFetch(`/fichas/${fichaId}/sessao/${sessaoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response || !response.ok) {
        const text = response ? await response.text() : "Sem resposta";
        throw new Error(text || "Erro ao atualizar sessão");
      }

      await loadSessoes();
    },
    [fichaId, loadSessoes],
  );

  const deleteSessao = useCallback(
    async (sessaoId) => {
      const response = await authFetch(`/fichas/${fichaId}/sessao/${sessaoId}`, {
        method: "DELETE",
      });

      if (!response || !response.ok) {
        throw new Error("Erro ao excluir sessão");
      }

      await loadSessoes();
    },
    [fichaId, loadSessoes],
  );

  return { sessoes, totalSegundos, loading, loadSessoes, updateSessao, deleteSessao };
}
