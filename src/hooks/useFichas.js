// src/hooks/useFichas.js
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { createEmptyFicha } from "../data/fichaTemplate";
import { supabase } from "../lib/supabase";

function formatarNome(username) {
  if (!username) return "Sistema";
  return username
    .split(".")
    .map(
      (parte) => parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase(),
    )
    .join(" ");
}

export function useFichas(currentUser) {
  const [fichas, setFichas] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeouts = useRef({});

  // ─── Ref para acessar fichas sem dependência ───
  const fichasRef = useRef(fichas);
  useEffect(() => {
    fichasRef.current = fichas;
  }, [fichas]);

  // ─── CARREGAR FICHAS ───
  useEffect(() => {
    async function loadFichas() {
      const { data, error } = await supabase
        .from("fichas")
        .select(`*, colecoes(id, cliente, codigo_proposta, descricao)`)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Supabase] Erro ao carregar fichas:", error);
      } else {
        const fichasConvertidas = data.map((f) => ({
          ...f.dados,
          // ✅ garante fotoData para fichas op 80
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
          colecao: f.colecoes,
        }));
        setFichas(fichasConvertidas);
      }

      setIsLoaded(true);
    }

    loadFichas();
  }, []);

  // ─── REALTIME ───
  useEffect(() => {
    const channel = supabase
      .channel("fichas-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "fichas" },
        (payload) => {
          const novaFicha = {
            ...payload.new.dados,
            userId: payload.new.user_id,
            criadoPor: payload.new.criado_por,
            dbId: payload.new.id,
            created_at: payload.new.created_at,
            updated_at: payload.new.updated_at,
            colecao_id: payload.new.colecao_id,
          };
          setFichas((prev) => {
            if (prev.some((f) => f.dbId === novaFicha.dbId)) return prev;
            return [novaFicha, ...prev];
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "fichas" },
        (payload) => {
          if (payload.new.deleted_at) {
            setFichas((prev) => prev.filter((f) => f.dbId !== payload.new.id));
            return;
          }
          const fichaAtualizada = {
            ...payload.new.dados,
            userId: payload.new.user_id,
            criadoPor: payload.new.criado_por,
            dbId: payload.new.id,
            created_at: payload.new.created_at,
            updated_at: payload.new.updated_at,
            colecao_id: payload.new.colecao_id,
          };
          setFichas((prev) =>
            prev.map((f) =>
              f.dbId === fichaAtualizada.dbId ? fichaAtualizada : f,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "fichas" },
        (payload) => {
          setFichas((prev) => prev.filter((f) => f.dbId !== payload.old.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ─── GERAR CÓDIGO ───
  async function gerarCodigo(operacao) {
    const prefixos = { 10: "PRO", 50: "TAF", 80: "FOTO", 90: "QUA" };
    const prefixo = prefixos[operacao] || "GEN";

    const { data, error } = await supabase
      .from("fichas")
      .select("codigo")
      .eq("operacao", operacao)
      .like("codigo", `${prefixo}-%`)
      .order("codigo", { ascending: false })
      .limit(1);

    if (error) return `${prefixo}-0001`;

    const numero =
      data.length > 0 ? parseInt(data[0].codigo.split("-")[1]) + 1 : 1;

    return `${prefixo}-${String(numero).padStart(4, "0")}`;
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
      };

      const { data, error } = await supabase
        .from("fichas")
        .insert({
          codigo: nova.codigo,
          operacao: operacaoCodigo,
          status: nova.status || "Rascunho",
          criado_por: nova.criadoPor,
          user_id: nova.userId,
          colecao_id: colecaoId,
          dados: nova,
        })
        .select("*")
        .single();

      if (error) {
        console.error("[Supabase] Erro ao criar ficha:", error);
        alert("Erro ao criar ficha.");
        return null;
      }

      return data.id;
    },
    [currentUser],
  );

  // ─── ATUALIZAR — sem [fichas] nas deps! ───
  const atualizarFicha = useCallback((id, updater) => {
    // Lê via ref — sem criar dependência reativa em fichas
    const fichaAtual = fichasRef.current.find(
      (f) => f.id === id || f.dbId === id,
    );
    if (!fichaAtual) return;

    console.log("🔍 buscando id:", id);
    console.log(
      "🔍 fichasRef:",
      fichasRef.current.map((f) => ({ id: f.id, dbId: f.dbId })),
    );

    console.log("🔍 fichaAtual:", fichaAtual);

    const fichaAtualizada =
      typeof updater === "function"
        ? updater(fichaAtual)
        : { ...fichaAtual, ...updater };

    // Atualiza estado local
    setFichas((prev) =>
      prev.map((f) => (f.dbId === fichaAtual.dbId ? fichaAtualizada : f)),
    );

    // Debounce para salvar no Supabase
    if (saveTimeouts.current[fichaAtual.dbId]) {
      clearTimeout(saveTimeouts.current[fichaAtual.dbId]);
    }

    saveTimeouts.current[fichaAtual.dbId] = setTimeout(async () => {
      const { error } = await supabase
        .from("fichas")
        .update({
          operacao: fichaAtualizada.operacao,
          status: fichaAtualizada.status,
          criado_por: fichaAtualizada.criadoPor,
          user_id: fichaAtualizada.userId,
          dados: {
            ...fichaAtualizada,
            userId: fichaAtualizada.userId,
            criadoPor: fichaAtualizada.criadoPor,
          },
        })
        .eq("id", fichaAtual.dbId);

      if (error) console.error("[Supabase] Erro ao atualizar ficha:", error);
      delete saveTimeouts.current[fichaAtual.dbId];
    }, 800);
  }, []); // ✅ deps vazia — estável para sempre

  // ─── ATUALIZAR OPERADORES ───
  const atualizarOperadores = useCallback(
    (fichaId, operadores) => {
      atualizarFicha(fichaId, (ficha) => ({ ...ficha, operadores }));
    },
    [atualizarFicha],
  );

  // ─── EXCLUIR ───
  const excluirFicha = useCallback(
    async (id) => {
      const ficha = fichasRef.current.find((f) => f.id === id || f.dbId === id);
      if (!ficha) return;

      setFichas((prev) => prev.filter((f) => f.dbId !== ficha.dbId));

      const { error } = await supabase
        .from("fichas")
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: currentUser?.username,
        })
        .eq("id", ficha.dbId);

      if (error) console.error("[Supabase] Erro ao mover para lixeira:", error);
    },
    [currentUser],
  ); // ✅ sem [fichas] nas deps

  // ─── PERMISSÕES ───
  const visibleFichas = useMemo(() => {
    if (!currentUser) return [];
    const permissoes = currentUser.permissoes || [];
    const podeVerTudo =
      currentUser.role === "admin" || permissoes.includes("ver_tudo");
    const verAprovacao = permissoes.includes("ver_aprovacao");
    const verEnviadas = permissoes.includes("ver_enviadas");

    if (podeVerTudo) return fichas;

    let fichasVisiveis = fichas.filter((f) => {
      const ehCriador = f.userId === currentUser.username;
      const ehOperador = (f.operadores || []).some(
        (op) => op.username === currentUser.username,
      );
      return ehCriador || ehOperador;
    });

    if (verAprovacao) {
      const aguardando = fichas.filter(
        (f) => f.statusAprovacao === "aguardando",
      );
      fichasVisiveis = [...fichasVisiveis, ...aguardando];
    }

    if (verEnviadas) {
      const enviadas = fichas.filter(
        (f) =>
          f.statusAprovacao === "aprovado" || f.statusAprovacao === "reprovado",
      );
      fichasVisiveis = [...fichasVisiveis, ...enviadas];
    }

    return fichasVisiveis.filter(
      (f, index, self) => index === self.findIndex((x) => x.dbId === f.dbId),
    );
  }, [fichas, currentUser]);

  // ─── Ref para visibleFichas (usado no getFicha) ───
  const visibleFichasRef = useRef(visibleFichas);
  useEffect(() => {
    visibleFichasRef.current = visibleFichas;
  }, [visibleFichas]);

  // ─── GET FICHA — sem [visibleFichas] nas deps ───
  const getFicha = useCallback(async (id) => {
    // Lê via ref — sem dependência reativa
    const local = visibleFichasRef.current.find(
      (f) => f.dbId === id || f.id === id,
    );
    if (local) return local;

    const { data, error } = await supabase
      .from("fichas")
      .select(`*, colecoes(id, cliente, codigo_proposta, descricao)`)
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error || !data) return null;

    return {
      ...data.dados,
      userId: data.user_id,
      criadoPor: data.criado_por,
      dbId: data.id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      colecao_id: data.colecao_id,
      colecao: data.colecoes,
    };
  }, []); // ✅ deps vazia — estável para sempre

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
