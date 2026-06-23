import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useColecoes() {
  const [colecoes, setColecoes] = useState([]);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data } = await supabase
      .from("colecoes")
      .select("*")
      .order("created_at", { ascending: false });

    setColecoes(data || []);
  }

  async function criarColecao(payload) {
    const { data, error } = await supabase
      .from("colecoes")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    setColecoes((prev) => [data, ...prev]);

    return data;
  }

  return {
    colecoes,
    criarColecao,
  };
}