import { useState, useEffect } from 'react'

export function useAuth() {

  const [user, setUser] = useState(null)

  useEffect(() => {

    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (savedUser && token) {
      setUser(JSON.parse(savedUser))
    }

  }, [])

  useEffect(() => {

    if (!user) return

    perfil()

    const interval = setInterval(() => {
      perfil()
    }, 5000)

    return () => clearInterval(interval)

  }, [user])

  async function authFetch(url, options = {}) {

    const token =
      localStorage.getItem('token')

    const response = await fetch(url, {

      ...options,

      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    })

    if (response.status === 401) {

      logout()

      alert('Sessão expirada')

      return null
    }

    return response
  }

  async function perfil() {

    try {

      const response = await authFetch(
        `${import.meta.env.VITE_API_URL}/perfil`
      )

      if (!response) return null

      const data = await response.json()

      if (data.user) {
        setUser(data.user)
      }

      return data

    } catch (err) {

      console.error(err)

      return null
    }
  }

  async function login(username, password) {

    try {

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/login`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            username,
            password
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.error)
        return false
      }

      localStorage.setItem(
        'token',
        data.token
      )

      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      )

      setUser(data.user)

      return true

    } catch (err) {

      console.error(err)

      alert('Erro conexão backend')

      return false
    }
  }

  function logout() {

    localStorage.removeItem('token')

    localStorage.removeItem('user')

    setUser(null)

  }

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout
  }
}