import { useState, useCallback, useEffect, useMemo } from 'react'
import { createEmptyFicha } from '../data/fichaTemplate'

const STORAGE_KEY = 'fichas-controle-v2' // Nova chave para evitar conflito com dados encriptados antigos

export function useFichas(currentUser) {
  const [fichas, setFichas] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  // ─── Carregamento Direto e Robusto ───
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        setFichas(JSON.parse(raw))
      }
    } catch (err) {
      console.error('[Storage] Erro ao carregar fichas:', err)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // ─── Salvamento Síncrono ───
  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fichas))
    } catch (err) {
      console.error('[Storage] Erro ao salvar:', err)
      if (err.name === 'QuotaExceededError') {
        alert('Memória do navegador cheia! Por favor, exclua fichas antigas.')
      }
    }
  }, [fichas, isLoaded])

  const criarFicha = useCallback((operacaoCodigo) => {
    const nova = {
      ...createEmptyFicha(operacaoCodigo),
      criadoPor: currentUser?.displayName || currentUser?.username || 'Sistema',
      userId: currentUser?.username || 'system'
    }
    
    setFichas(prev => [nova, ...prev])
    return nova.id
  }, [currentUser])

  const atualizarFicha = useCallback((id, updater) => {
    setFichas(prev => prev.map(f =>
      f.id === id ? (typeof updater === 'function' ? updater(f) : { ...f, ...updater }) : f
    ))
  }, [])

  const excluirFicha = useCallback((id) => {
    setFichas(prev => prev.filter(f => f.id !== id))
  }, [])

  // Filtra as fichas visíveis baseadas no cargo
  const visibleFichas = useMemo(() => {
    if (!currentUser) return []
    // Cargos de aprovação, gerência e administração
    const cargosGlobais = ['admin', 'projetos', 'aprovacao', 'corretor']
    
    if (cargosGlobais.includes(currentUser.role)) {
      return fichas
    }

    // Se for 'operador', 'producao' ou outros cargos restritos, vê apenas o que ele mesmo criou
    return fichas.filter(f => f.userId === currentUser.username)
  }, [fichas, currentUser])

  const getFicha = useCallback((id) => {
    // Garante que o usuário só consiga obter fichas que ele tem permissão para ver
    return visibleFichas.find(f => f.id === id) || null
  }, [visibleFichas])

  return { 
    fichas: visibleFichas, 
    isLoading: !isLoaded,
    criarFicha, 
    atualizarFicha, 
    excluirFicha, 
    getFicha 
  }
}
