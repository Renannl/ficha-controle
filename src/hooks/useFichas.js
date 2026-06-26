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
            const existe = prev.some((f) => f.dbId === novaFicha.dbId);
            if (existe) return prev;
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
    const prefixos = {
      10: "PRO",
      50: "TAF",
      80: "FOTO",
      90: "QUA",
    };
    const prefixo = prefixos[operacao] || "GEN";

    const { data, error } = await supabase
      .from("fichas")
      .select("codigo")
      .eq("operacao", operacao)
      .like("codigo", `${prefixo}-%`)
      .order("codigo", { ascending: false })
      .limit(1);

    if (error) {
      console.error(error);
      return `${prefixo}-0001`;
    }

    let numero = 1;
    if (data.length > 0) {
      const ultimoNumero = parseInt(data[0].codigo.split("-")[1]);
      numero = ultimoNumero + 1;
    }

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

  // ─── ATUALIZAR ───
  const atualizarFicha = useCallback(
    (id, updater) => {
      // Busca por id interno OU dbId
      const fichaAtual = fichas.find((f) => f.id === id || f.dbId === id);

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

        if (error) {
          console.error("[Supabase] Erro ao atualizar ficha:", error);
        }

        delete saveTimeouts.current[fichaAtual.dbId];
      }, 800); // ← reduzi de 8000 para 800ms (8s era muito alto)
    },
    [fichas],
  );

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
      const ficha = fichas.find((f) => f.id === id || f.dbId === id);
      if (!ficha) return;

      setFichas((prev) => prev.filter((f) => f.dbId !== ficha.dbId));

      const { error } = await supabase
        .from("fichas")
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: currentUser?.username,
        })
        .eq("id", ficha.dbId);

      if (error) {
        console.error("[Supabase] Erro ao mover para lixeira:", error);
      }
    },
    [fichas, currentUser],
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

  // ─── GET FICHA (com fallback Supabase) ───
  const getFicha = useCallback(
    async (id) => {
      const local = visibleFichas.find((f) => f.dbId === id || f.id === id);
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
    },
    [visibleFichas],
  );

  // ─── ✅ RETURN (estava faltando!) ───
  return {
    fichas: visibleFichas,
    isLoading: !isLoaded, // ← App.jsx usa isLoading, hook tinha isLoaded
    criarFicha,
    atualizarFicha,
    excluirFicha,
    getFicha,
    atualizarOperadores,
  };
}
