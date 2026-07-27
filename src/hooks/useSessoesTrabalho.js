import { useState, useEffect, useCallback, useMemo } from "react";
import { authFetch } from "../services/apiClient";
import { calcularTempoDecorridoReal } from "../utils/tempoUtils";

const POLL_INTERVAL_MS = 15000; // busca dados reais do backend a cada 15s

export function useSessoesTrabalho(fichaId) {
  const [sessoes, setSessoes] = useState([]);
  const [totalSegundos, setTotalSegundos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

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

  const haSessaoAberta = useMemo(
    () => sessoes.some((s) => !s.fim),
    [sessoes],
  );

  // ⏱️ tick visual: atualiza o cronômetro a cada segundo (client-side)
  useEffect(() => {
    if (!haSessaoAberta) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [haSessaoAberta]);

  // 🔄 poll real: busca do backend se a sessão ainda está de fato aberta
  useEffect(() => {
    if (!haSessaoAberta) return;
    const poll = setInterval(() => {
      loadSessoes();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [haSessaoAberta, loadSessoes]);

  const tempoDecorridoSegundos = useMemo(
    () => calcularTempoDecorridoReal(sessoes),
    [sessoes, tick], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const totalSegundosAoVivo = useMemo(() => {
    const agora = Date.now();
    return sessoes.reduce((acc, s) => {
      if (s.fim) return acc + Number(s.duracao_segundos || 0);
      const inicioMs = new Date(s.inicio).getTime();
      return acc + (agora - inicioMs) / 1000;
    }, 0);
  }, [sessoes, tick]); // eslint-disable-line react-hooks/exhaustive-deps

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
        { method: "DELETE" },
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
    totalSegundos: totalSegundosAoVivo,
    tempoDecorridoSegundos,
    loading,
    loadSessoes,
    updateSessao,
    deleteSessao,
  };
}
