import { useCallback } from "react";

export function useOperators({ user, onAtualizarOperadores, podeGerenciar }) {
  const handleToggleOperadorFicha = useCallback(
    (e, ficha, usuario) => {
      e?.stopPropagation?.();

      const operadoresAtuais = ficha.operadores || [];

      const jaExiste = operadoresAtuais.some(
        (op) => op.id === usuario.id || op.username === usuario.username,
      );

      if (jaExiste && !podeGerenciar) return;

      let novosOperadores;

      if (jaExiste) {
        novosOperadores = operadoresAtuais.filter(
          (op) => op.id !== usuario.id && op.username !== usuario.username,
        );
      } else {
        novosOperadores = [
          ...operadoresAtuais,
          {
            id: usuario.id,
            nome: usuario.nome,
            username: usuario.username,
          },
        ];
      }

      onAtualizarOperadores?.(ficha.dbId, novosOperadores);
    },
    [onAtualizarOperadores, podeGerenciar],
  );

  return {
    handleToggleOperadorFicha,
    podeGerenciarOperadores: !!podeGerenciar,
  };
}
