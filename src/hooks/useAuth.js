import { useState, useCallback } from 'react'

const SESSION_KEY = 'ficha-controle-session'

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(user) {
  if (user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } else {
    sessionStorage.removeItem(SESSION_KEY)
  }
}

/**
 * Hook de autenticação
 * - Usa sessionStorage (sessão do navegador — fecha a aba, perde o login)
 * - Preparado para integrar com Active Directory (LDAP / Azure AD)
 */
export function useAuth() {
  const [user, setUser] = useState(loadSession)

  const login = useCallback((userData) => {
    saveSession(userData)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    saveSession(null)
    setUser(null)
  }, [])

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  }
}
