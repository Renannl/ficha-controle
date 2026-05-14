import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginScreen({ onLogin }) {

  const navigate = useNavigate()

  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {

    e.preventDefault()

    setErro('')

    if (!usuario.trim() || !senha.trim()) {

      setErro('Preencha todos os campos.')

      return
    }

    setLoading(true)

    try {

      const success =
        await onLogin(usuario, senha)

      if (!success) {

        setErro('Usuário inválido')

      } else {

        navigate('/dashboard')
      }

    } catch (err) {

      console.error(err)

      setErro('Erro ao conectar no servidor')
    }

    setLoading(false)
  }

  return (
    <div className="login-page">

      <div className="login-container">

        <div className="login-brand">
          <div className="login-logo">
            <img
              src="/ip.png"
              alt="IndusPower Logo"
              className="login-logo-img"
            />
          </div>

          <p className="login-subtitle">
            Centro de Controle de Fichas
          </p>
        </div>

        <form
          className="login-card"
          onSubmit={handleSubmit}
        >

          <div className="login-card-header">
            <h2>Acesso ao Sistema</h2>
            <p>Entre com suas credenciais corporativas</p>
          </div>

          <div className="login-fields">

            <div className="login-field">

              <label htmlFor="login-user">
                Usuário
              </label>

              <input
                id="login-user"
                type="text"
                value={usuario}
                onChange={(e) =>
                  setUsuario(e.target.value)
                }
                disabled={loading}
              />

            </div>

            <div className="login-field">

              <label htmlFor="login-pass">
                Senha
              </label>

              <input
                id="login-pass"
                type="password"
                value={senha}
                onChange={(e) =>
                  setSenha(e.target.value)
                }
                disabled={loading}
              />

            </div>

          </div>

          {erro && (
            <div className="login-error">
              {erro}
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? 'Entrando...'
              : 'Entrar'}
          </button>

        </form>

      </div>

    </div>
  )
}