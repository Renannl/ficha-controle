import { useState, useEffect } from 'react'

export function useAuth() {

  const [user, setUser] = useState(null)

  const [isAuthenticated, setIsAuthenticated] =
    useState(false)

  useEffect(() => {

    const savedUser =
      localStorage.getItem('user')

    const token =
      localStorage.getItem('token')

    if (savedUser && token) {

      setUser(JSON.parse(savedUser))

      setIsAuthenticated(true)
    }

  }, [])

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

      setIsAuthenticated(true)

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

    setIsAuthenticated(false)
  }

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout
  }
}