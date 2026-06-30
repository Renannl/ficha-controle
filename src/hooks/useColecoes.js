import { useEffect, useState } from "react";

export function useColecoes() {
  const [colecoes, setColecoes] = useState([]);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const response = await fetch("http://localhost:3001/colecoes");
      const data = await response.json();

      setColecoes(data || []);
    } catch (error) {
      console.error(error);
    }
  }

  async function criarColecao(payload) {
    try {
      const response = await fetch("http://localhost:3001/colecoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      setColecoes((prev) => [data, ...prev]);

      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  return {
    colecoes,
    criarColecao,
  };
}