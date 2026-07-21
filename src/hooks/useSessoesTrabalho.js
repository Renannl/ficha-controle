import { useState, useEffect, useCallback, useMemo } from "react";
import { authFetch } from "../services/apiClient";
import { calcularTempoDecorridoReal } from "../utils/tempoUtils";

export function useSessoesTrabalho(fichaId) {
  const [sessoes, setSessoes] = useState([]);
  const [totalSegundos, setTotalSegundos] = useState(0); // homem-hora (vem do backend)
  const [loading, setLoading] = useState(true);

  // ✅ Apenas UMA função de carregamento (removi a duplicada "carregar")
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

  // ✅ Apenas UM useEffect chamando o load (removi o duplicado)
  useEffect(() => {
    loadSessoes();
  }, [loadSessoes]);

  // 👇 NOVO: calcula o tempo real da ficha (wall-clock) a partir das sessões já carregadas
  // useMemo evita recalcular em todo re-render, só quando "sessoes" mudar
  const tempoDecorridoSegundos = useMemo(
    () => calcularTempoDecorridoReal(sessoes),
    [sessoes],
  );

  const updateSessao = useCallback(
    async (sessaoId, payload) => {
      const response = await authFetch(
        `/fichas/${fichaId}/sessao/${sessaoId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

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
      const response = await authFetch(
        `/fichas/${fichaId}/sessao/${sessaoId}`,
        {
          method: "DELETE",
        },
      );

      if (!response || !response.ok) {
        throw new Error("Erro ao excluir sessão");
      }

      await loadSessoes();
    },
    [fichaId, loadSessoes],
  );

  return {
    sessoes,
    totalSegundos, // homem-hora (soma bruta, duplica overlap)
    tempoDecorridoSegundos, // 👈 NOVO: tempo real da ficha (sem duplicar overlap)
    loading,
    loadSessoes,
    updateSessao,
    deleteSessao,
  };
}
