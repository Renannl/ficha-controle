import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { createEmptyFicha } from "../data/fichaTemplate";

const API = "http://localhost:3001";

function formatarNome(username) {
  if (!username) return "Sistema";
  return username
    .split(".")
    .map(
      (parte) => parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase(),
    )
    .join(" ");
}

function converterFicha(f) {
  return {
    ...f.dados,
    fotoData: f.dados?.fotoData ?? {
      verificacoes: [],
      responsavelTecnico: "",
      dataHoraInicio: "",
    },
    userId: f.user_id,
    criadoPor: f.criado_por,
    dbId: f.id,
    created_at: f.created_at,
    updated_at: f.updated_at,
    colecao_id: f.colecao_id,
    colecao: f.colecoes ?? null,
  };
}

export function useFichas(currentUser) {
  const [fichas, setFichas] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeouts = useRef({});
  const fichasRef = useRef(fichas);

  useEffect(() => {
    fichasRef.current = fichas;
  }, [fichas]);

  // ─── CARREGAR FICHAS ───
  useEffect(() => {
    async function loadFichas() {
      try {
        const res = await fetch(`${API}/fichas`);
        const data = await res.json();
        setFichas(data.map(converterFicha));
      } catch (err) {
        console.error("[API] Erro ao carregar fichas:", err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadFichas();
  }, []);

  // ─── POLLING (substitui realtime do Supabase) ───
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/fichas`);
        const data = await res.json();
        setFichas(data.map(converterFicha));
      } catch (err) {
        console.error("[API] Erro no polling:", err);
      }
    }, 15000); // atualiza a cada 15s

    return () => clearInterval(interval);
  }, []);

  // ─── GERAR CÓDIGO ───
  async function gerarCodigo(operacao) {
    const prefixos = { 10: "PRO", 50: "TAF", 80: "FOTO", 90: "QUA" };
    const prefixo = prefixos[operacao] || "GEN";

    try {
      const res = await fetch(`${API}/fichas`);
      const data = await res.json();

      const filtradas = data.filter(
        (f) =>
          String(f.operacao) === String(operacao) &&
          f.codigo?.startsWith(`${prefixo}-`),
      );

      const numeros = filtradas
        .map((f) => parseInt(f.codigo?.split("-")[1]))
        .filter(Boolean);

      const proximo = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;
      return `${prefixo}-${String(proximo).padStart(4, "0")}`;
    } catch {
      return `${prefixo}-0001`;
    }
  }

  // ─── CRIAR ───
  const criarFicha = useCallback(
    async (operacaoCodigo, colecaoId) => {
      const codigoGerado = await gerarCodigo(operacaoCodigo);
      const nova = {
        ...createEmptyFicha(operacaoCodigo),
        codigo: codigoGerado,
        operadores: [],
        criadoPor:
          currentUser?.displayName ||
          formatarNome(currentUser?.username) ||
          "Sistema",
        userId: currentUser?.username || "system",
        colecao_id: colecaoId || null,
      };

      try {
        const res = await fetch(`${API}/fichas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nova),
        });

        if (!res.ok) throw new Error("Erro ao criar ficha");

        const data = await res.json();
        const fichaConvertida = converterFicha(data);
        setFichas((prev) => [fichaConvertida, ...prev]);
        return data.id;
      } catch (err) {
        console.error("[API] Erro ao criar ficha:", err);
        alert("Erro ao criar ficha.");
        return null;
      }
    },
    [currentUser],
  );

  // ─── ATUALIZAR ───
  const atualizarFicha = useCallback((id, updater) => {
    const fichaAtual = fichasRef.current.find(
      (f) => f.id === id || f.dbId === id,
    );
    if (!fichaAtual) return;

    const fichaAtualizada =
      typeof updater === "function"
        ? updater(fichaAtual)
        : { ...fichaAtual, ...updater };

    setFichas((prev) =>
      prev.map((f) => (f.dbId === fichaAtual.dbId ? fichaAtualizada : f)),
    );

    if (saveTimeouts.current[fichaAtual.dbId]) {
      clearTimeout(saveTimeouts.current[fichaAtual.dbId]);
    }

    saveTimeouts.current[fichaAtual.dbId] = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/fichas/${fichaAtual.dbId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fichaAtualizada),
        });
        if (!res.ok) throw new Error("Erro ao atualizar");
      } catch (err) {
        console.error("[API] Erro ao atualizar ficha:", err);
      } finally {
        delete saveTimeouts.current[fichaAtual.dbId];
      }
    }, 800);
  }, []);

  // ─── ATUALIZAR OPERADORES ───
  const atualizarOperadores = useCallback(
    (fichaId, operadores) => {
      atualizarFicha(fichaId, (f) => ({ ...f, operadores }));
    },
    [atualizarFicha],
  );

  // ─── EXCLUIR ───
  const excluirFicha = useCallback(async (id) => {
    const ficha = fichasRef.current.find((f) => f.id === id || f.dbId === id);
    if (!ficha) return;

    setFichas((prev) => prev.filter((f) => f.dbId !== ficha.dbId));

    try {
      await fetch(`${API}/fichas/${ficha.dbId}`, { method: "DELETE" });
    } catch (err) {
      console.error("[API] Erro ao excluir ficha:", err);
    }
  }, []);

  // ─── PERMISSÕES ───
  const visibleFichas = useMemo(() => {
    if (!currentUser) return [];
    const permissoes = currentUser.permissoes || [];
    const podeVerTudo =
      currentUser.role === "admin" || permissoes.includes("ver_tudo");
    const verAprovacao = permissoes.includes("ver_aprovacao");
    const verEnviadas = permissoes.includes("ver_enviadas");

    if (podeVerTudo) return fichas;

    let visiveis = fichas.filter((f) => {
      const ehCriador = f.userId === currentUser.username;
      const ehOperador = (f.operadores || []).some(
        (op) => op.username === currentUser.username,
      );
      return ehCriador || ehOperador;
    });

    if (verAprovacao) {
      visiveis = [
        ...visiveis,
        ...fichas.filter((f) => f.statusAprovacao === "aguardando"),
      ];
    }

    if (verEnviadas) {
      visiveis = [
        ...visiveis,
        ...fichas.filter(
          (f) =>
            f.statusAprovacao === "aprovado" ||
            f.statusAprovacao === "reprovado",
        ),
      ];
    }

    return visiveis.filter(
      (f, i, self) => i === self.findIndex((x) => x.dbId === f.dbId),
    );
  }, [fichas, currentUser]);

  // ─── GET FICHA ───
  const visibleFichasRef = useRef(visibleFichas);
  useEffect(() => {
    visibleFichasRef.current = visibleFichas;
  }, [visibleFichas]);

  const getFicha = useCallback(async (id) => {
    const local = visibleFichasRef.current.find(
      (f) => f.dbId === id || f.id === id,
    );
    if (local) return local;

    try {
      const res = await fetch(`${API}/fichas/${id}`);
      if (!res.ok) return null;
      const data = await res.json();
      return converterFicha(data);
    } catch {
      return null;
    }
  }, []);

  return {
    fichas: visibleFichas,
    isLoading: !isLoaded,
    criarFicha,
    atualizarFicha,
    excluirFicha,
    getFicha,
    atualizarOperadores,
  };
}
