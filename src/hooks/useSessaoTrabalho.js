import { useState, useCallback } from "react";
import api from "../services/api";

export function useSessaoTrabalho(fichaId) {
  const [sessaoAtiva, setSessaoAtiva] = useState(null);

  const play = useCallback(async () => {
    const { data } = await api.post(`/fichas/${fichaId}/sessao/iniciar`);
    setSessaoAtiva(data);
  }, [fichaId]);

  const pause = useCallback(async () => {
    await api.put(`/fichas/${fichaId}/sessao/pausar`);
    setSessaoAtiva(null);
  }, [fichaId]);

  return { sessaoAtiva, play, pause };
}
