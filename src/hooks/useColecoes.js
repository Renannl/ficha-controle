import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function useColecoes() {
  const [colecoes, setColecoes] = useState([]);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const response = await fetch(`${API_URL}/colecoes`);
      console.log("Status:", response.status);
      console.log("URL chamada:", `${API_URL}/colecoes`);

      if (!response.ok) {
        const text = await response.text();
        console.error("Resposta bruta:", text);
        return;
      }

      const data = await response.json();
      setColecoes(data || []);
    } catch (error) {
      console.error(error);
    }
  }

  async function criarColecao(payload) {
    try {
      const response = await fetch(`${API_URL}/colecoes`, {
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
