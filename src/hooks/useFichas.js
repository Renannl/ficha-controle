import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { createEmptyFicha } from "../data/fichaTemplate";
import { useAuth } from "./useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function formatarNome(nome) {
  if (!nome) return "Sistema";
  return nome
    .split(/[.\s]+/)
    .filter(Boolean)
    .map(
      (parte) => parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase(),
    )
    .join(" ");
}

function converterFicha(f) {
  return {
    ...f.dados,
    items: f.dados?.items ?? [], // 🆕
    operadores: f.dados?.operadores ?? [], // 🆕
    assinaturas: f.dados?.assinaturas ?? {
      producao: {},
      tecnico: {},
      supervisor: {},
      qualidade: {},
    }, // 🆕 evita quebrar .assinaturas.producao.dataUrl
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
  const { authFetch } = useAuth();
  const [fichas, setFichas] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeouts = useRef({});
  const fichasRef = useRef(fichas);
  const pendingIds = useRef(new Set()); // 🆕 controla fichas com escrita em voo

  useEffect(() => {
    fichasRef.current = fichas;
  }, [fichas]);

  // ─── CARREGAR FICHAS ───
  const loadFichas = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/fichas`);
      const data = await res.json();
      setFichas(data.map(converterFicha));
    } catch (err) {
      console.error("[API] Erro ao carregar fichas:", err);
    } finally {
      setIsLoaded(true);
    }
  }, [authFetch]);

  useEffect(() => {
    loadFichas();
  }, [loadFichas]);

  // ─── POLLING (não sobrescreve fichas com save pendente) ───
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await authFetch(`${API_URL}/fichas`);
        const data = await res.json();
        const remotas = data.map(converterFicha);

        setFichas((prev) => {
          // mescla: mantém localmente as fichas que têm escrita pendente
          return remotas.map((remota) => {
            if (pendingIds.current.has(remota.dbId)) {
              const local = prev.find((f) => f.dbId === remota.dbId);
              return local || remota;
            }
            return remota;
          });
        });
      } catch (err) {
        console.error("[API] Erro no polling:", err);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // ─── GERAR CÓDIGO ───
  async function gerarCodigo(operacao) {
    const prefixos = { 10: "PRO", 50: "TAF", 80: "FOTO", 90: "QUA" };
    const prefixo = prefixos[operacao] || "GEN";

    try {
      const res = await authFetch(`${API_URL}/fichas`);
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

  async function gerarNumeroInd(colecaoId) {
    try {
      const res = await authFetch(`${API_URL}/fichas`);
      const data = await res.json();

      // Fichas que já pertencem a essa coleção
      const fichasDaColecao = data.filter(
        (f) => String(f.colecao_id) === String(colecaoId),
      );

      let base;

      if (fichasDaColecao.length > 0) {
        // Coleção já tem fichas → reaproveita a base já usada
        base = String(fichasDaColecao[0].dados?.numeroInd || "").split("-")[0];
      } else {
        // Coleção nova → gera a próxima base global (10066, 10067, 10068...)
        const bases = data
          .map((f) =>
            parseInt(String(f.dados?.numeroInd || "").split("-")[0], 10),
          )
          .filter((n) => !isNaN(n));

        const maiorBase = bases.length > 0 ? Math.max(...bases) : 10065; // próxima = 10066
        base = String(maiorBase + 1);
      }

      // Sequencial dentro da própria coleção
      const numeros = fichasDaColecao
        .map((f) =>
          parseInt(String(f.dados?.numeroInd || "").split("-")[1], 10),
        )
        .filter((n) => !isNaN(n));

      const proximo = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;
      return `${base}-${String(proximo).padStart(2, "0")}`;
    } catch (err) {
      console.error(err);
      return "10066-01";
    }
  }

  // ─── CRIAR ───
  const criarFicha = useCallback(
    async (operacaoCodigo, colecaoId, dadosIniciais = {}) => {
      const codigoGerado = await gerarCodigo(operacaoCodigo);
      const numeroIndGerado = await gerarNumeroInd(colecaoId); // 🔄 agora recebe colecaoId, não operacaoCodigo

      const nova = {
        ...createEmptyFicha(operacaoCodigo),
        ...dadosIniciais,
        codigo: codigoGerado,
        numeroInd: numeroIndGerado,
        revisao: "01",
        criadoPor: formatarNome(
          currentUser?.displayName || currentUser?.username,
        ),
        userId: currentUser?.username || "system",
        operadores: [],
      };

      try {
        const res = await authFetch(`${API_URL}/fichas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            codigo: nova.codigo,
            operacao: operacaoCodigo,
            colecao_id: colecaoId,
            status: nova.status || "Rascunho",
            criado_por: nova.criadoPor,
            user_id: nova.userId,
            dados: nova,
          }),
        });

        if (!res || !res.ok) throw new Error("Erro ao criar ficha");

        const data = await res.json();
        const nova_ficha = converterFicha(data);
        setFichas((prev) => [nova_ficha, ...prev]);

        return nova_ficha.dbId; // ⚠️ padronize: dbId, não id
      } catch (err) {
        console.error("[API] Erro ao criar ficha:", err);
        alert("Erro ao criar ficha.");
        return null;
      }
    },
    [currentUser],
  );

  // ─── ATUALIZAR ───
  const atualizarFicha = useCallback(
    (id, updater) => {
      setFichas((prev) => {
        const fichaAtual = prev.find(
          (f) => String(f.id) === String(id) || String(f.dbId) === String(id),
        );

        if (!fichaAtual) return prev;

        const fichaAtualizada =
          typeof updater === "function"
            ? updater(fichaAtual)
            : { ...fichaAtual, ...updater };

        pendingIds.current.add(fichaAtual.dbId); // 🆕 marca como pendente

        if (saveTimeouts.current[fichaAtual.dbId]) {
          clearTimeout(saveTimeouts.current[fichaAtual.dbId]);
        }

        saveTimeouts.current[fichaAtual.dbId] = setTimeout(async () => {
          try {
            const res = await authFetch(
              `${API_URL}/fichas/${fichaAtual.dbId}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fichaAtualizada),
              },
            );
            if (!res || !res.ok) throw new Error("Erro ao atualizar");
          } catch (err) {
            console.error("[API] Erro ao atualizar ficha:", err);
          } finally {
            delete saveTimeouts.current[fichaAtual.dbId];
            pendingIds.current.delete(fichaAtual.dbId); // 🆕 libera após salvar
          }
        }, 800);

        return prev.map((f) =>
          f.dbId === fichaAtual.dbId ? fichaAtualizada : f,
        );
      });
    },
    [authFetch],
  );

  const revisarFicha = useCallback(
    async (id) => {
      const ficha = fichas.find((f) => f.id === id);
      if (!ficha) return;

      const atual = parseInt(ficha.revisao || "0", 10);
      const novaRevisao = String(atual + 1).padStart(2, "0");

      atualizarFicha(id, (f) => ({
        ...f,
        revisao: novaRevisao,
        status: "Rascunho", // volta pra edição
      }));
    },
    [fichas, atualizarFicha],
  );

  // ─── ATUALIZAR OPERADORES ───
  const atualizarOperadores = useCallback(
    (fichaId, operadores) => {
      atualizarFicha(fichaId, (f) => ({ ...f, operadores }));
    },
    [atualizarFicha],
  );

  // ─── EXCLUIR ───
  const excluirFicha = useCallback(
    async (id) => {
      // useFichas.js — excluirFicha
      const ficha = fichasRef.current.find(
        (f) => String(f.id) === String(id) || String(f.dbId) === String(id),
      );

      if (!ficha) return;

      setFichas((prev) => prev.filter((f) => f.dbId !== ficha.dbId));

      try {
        await authFetch(`${API_URL}/fichas/${ficha.dbId}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.error("[API] Erro ao excluir ficha:", err);
      }
    },
    [authFetch],
  );

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

  const getFicha = useCallback(
    async (id) => {
      // usa o state atual via closure do fichas, não um ref desatualizado
      const local = fichasRef.current.find(
        (f) => String(f.dbId) === String(id) || String(f.id) === String(id),
      );

      if (local) return local;

      try {
        const res = await authFetch(`${API_URL}/fichas/${id}`);
        if (!res.ok) return null;
        const data = await res.json();
        return converterFicha(data);
      } catch {
        return null;
      }
    },
    [authFetch],
  );

  return {
    fichas: visibleFichas,
    isLoading: !isLoaded,
    criarFicha,
    atualizarFicha,
    excluirFicha,
    getFicha,
    atualizarOperadores,
    revisarFicha,
    recarregarFichas: loadFichas,
  };
}
