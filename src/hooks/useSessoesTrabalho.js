import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { authFetch } from "../services/apiClient";
import { calcularTempoDecorridoReal } from "../utils/tempoUtils";

export function useSessoesTrabalho(fichaId) {
  const [sessoes, setSessoes] = useState([]);
  const [totalSegundos, setTotalSegundos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0); // ⏱️ força recálculo a cada segundo

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

  // ⏱️ Atualiza o "tick" a cada segundo apenas se houver sessão aberta
  const haSessaoAberta = useMemo(
    () => sessoes.some((s) => !s.fim),
    [sessoes],
  );

  useEffect(() => {
    if (!haSessaoAberta) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [haSessaoAberta]);

  // Recalcula tempo decorrido considerando o tick (tempo real)
  const tempoDecorridoSegundos = useMemo(
    () => calcularTempoDecorridoReal(sessoes),
    [sessoes, tick], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Recalcula total (homem-hora) somando segundos "ao vivo" das sessões abertas
  const totalSegundosAoVivo = useMemo(() => {
    const agora = Date.now();
    return sessoes.reduce((acc, s) => {
      if (s.fim) {
        return acc + Number(s.duracao_segundos || 0);
      }
      const inicioMs = new Date(s.inicio).getTime();
      const decorrido = (agora - inicioMs) / 1000;
      return acc + decorrido;
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
