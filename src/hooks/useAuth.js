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

  const response = await fetch(
    'http://localhost:3001/login',
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