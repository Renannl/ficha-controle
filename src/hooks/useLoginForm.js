import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function useLoginForm(onLogin) {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setErro("");

    if (!usuario.trim() || !senha.trim()) {
      setErro("Preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      const success = await onLogin(usuario, senha);

      if (!success) {
        setErro("Usuário inválido");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setErro("Erro ao conectar no servidor");
    } finally {
      setLoading(false);
    }
  }

  return {
    usuario,
    senha,
    erro,
    loading,
    setUsuario,
    setSenha,
    handleSubmit,
  };
}