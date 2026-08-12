import { useState, useEffect, useCallback, useMemo } from "react";
import { authFetch } from "../services/apiClient";
import { calcularTempoDecorridoReal } from "../utils/tempoUtils";

const POLL_INTERVAL_MS = 15000;

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

  const haSessaoAberta = useMemo(() => sessoes.some((s) => !s.fim), [sessoes]);

  useEffect(() => {
    if (!haSessaoAberta) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [haSessaoAberta]);

  useEffect(() => {
    if (!haSessaoAberta) return;
    const poll = setInterval(() => {
      loadSessoes();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [haSessaoAberta, loadSessoes]);

  const tempoDecorridoSegundos = useMemo(
    () => calcularTempoDecorridoReal(sessoes),
    [sessoes, tick],
  );

  const totalSegundosAoVivo = useMemo(() => {
    const agora = Date.now();
    return sessoes.reduce((acc, s) => {
      if (s.fim) return acc + Number(s.duracao_segundos || 0);
      const inicioMs = new Date(s.inicio).getTime();
      return acc + (agora - inicioMs) / 1000;
    }, 0);
  }, [sessoes, tick]);

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

  const pararTodasSessoes = useCallback(async () => {
    const abertas = sessoes.filter((s) => !s.fim);
    if (abertas.length === 0) return;

    console.log(
      `[useSessoesTrabalho] ⏹️ Parando ${abertas.length} sessão(ões) ativa(s)`,
    );

    const response = await authFetch(`/fichas/${fichaId}/sessoes/parar-todas`, {
      method: "POST",
    });

    if (!response || !response.ok) {
      const text = response ? await response.text() : "Sem resposta";
      console.error("[useSessoesTrabalho] Erro ao parar sessões:", text);
      return;
    }

    const data = await response.json();
    console.log(`[useSessoesTrabalho] ✅ ${data.paradas} sessão(ões) paradas`);

    await loadSessoes();
  }, [fichaId, sessoes, loadSessoes]);

  return {
    sessoes,
    totalSegundos: totalSegundosAoVivo,
    tempoDecorridoSegundos,
    loading,
    loadSessoes,
    updateSessao,
    deleteSessao,
    pararTodasSessoes,
  };
}
