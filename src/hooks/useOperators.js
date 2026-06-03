import { useCallback } from "react";
import { hasPermission } from "../utils/hasPermission";

/**
 * Hook responsável por gerenciar operadores dentro de fichas
 */
export function useOperators({ user, onAtualizarOperadores, podeGerenciar }) {
  const handleToggleOperadorFicha = useCallback(
    (e, ficha, usuario) => {
      e?.stopPropagation?.();

      const operadoresAtuais = ficha.operadores || [];

      const jaExiste = operadoresAtuais.some(
        (op) => op.id === usuario.id || op.username === usuario.username,
      );

      // Se já existe e usuário não tem permissão, bloqueia remoção
      if (jaExiste && !podeGerenciar) return;

      let novosOperadores;

      if (jaExiste) {
        // remove
        novosOperadores = operadoresAtuais.filter(
          (op) => op.id !== usuario.id && op.username !== usuario.username,
        );
      } else {
        // adiciona
        novosOperadores = [
          ...operadoresAtuais,
          {
            id: usuario.id,
            nome: usuario.nome,
            username: usuario.username,
          },
        ];
      }

      onAtualizarOperadores?.(ficha.id, novosOperadores);
    },
    [onAtualizarOperadores, podeGerenciar],
  );

  return {
    handleToggleOperadorFicha,
    podeGerenciarOperadores: !!podeGerenciar,
  };
}
