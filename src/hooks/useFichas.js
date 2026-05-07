import { useState, useCallback, useEffect, useMemo } from 'react'
import { createEmptyFicha } from '../data/fichaTemplate'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'fichas-controle-v2' // Nova chave para evitar conflito com dados encriptados antigos

export function useFichas(currentUser) {
  const [fichas, setFichas] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    async function loadFichas() {
      // Lógica para carregar fichas do Supabase
      const { data, error } = await supabase.from('fichas').select('*').order('created_at', { ascending: false })
        
      if (error) {
        console.error('[Supabase] Erro ao carregar fichas:', error)
      } else {
        const fichasConvertidas = data.map(f => ({
          ...f.dados,
          dbId: f.id, // ID do Supabase
        }))

          setFichas(fichasConvertidas)
        }

        setIsLoaded(true)
      }

      loadFichas()
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

  const criarFicha = useCallback(async (operacaoCodigo) => {
    const nova = {
      ...createEmptyFicha(operacaoCodigo),
      criadoPor: currentUser?.displayName || currentUser?.username || 'Sistema',
      userId: currentUser?.username || 'system'
    }
    
    const { data, error } = await supabase
    .from('fichas')
    .insert([{ 
      codigo: nova.codigo, 
      operacao: nova.operacao, 
      status: nova.status, 
      criado_por: nova.criadoPor, 
      user_id: nova.userId, 
      dados: nova }
    ])
    .select('*')
    .single()

    if (error) {
      console.error('[Supabase] Erro ao criar ficha:', error)
      alert('Erro ao criar ficha. Tente novamente.')
    return null
    }
    
    const fichaConvertida = {
      ...data.dados,
      dbId: data.id
    }

    setFichas(prev => [fichaConvertida, ...prev])
    return fichaConvertida.id
  }, [currentUser])

  const atualizarFicha = useCallback(async (id, updater) => {
    const fichaAtual = fichas.find(f => f.id === id)

    if (!fichaAtual) return

    const fichaAtualizada =
      typeof updater === 'function'
        ? updater(fichaAtual)
        : { ...fichaAtual, ...updater }

    setFichas(prev =>
      prev.map(f => (f.id === id ? fichaAtualizada : f))
    )

    const { error } = await supabase
      .from('fichas')
      .update({
        dados: fichaAtualizada,
        status: fichaAtualizada.status,
        operacao: fichaAtualizada.operacao
      })
      .eq('id', fichaAtual.dbId)

    if (error) {
      console.error('[Supabase] Erro ao atualizar ficha:', error)
    }
  }, [fichas])

  const excluirFicha = useCallback(async (id) => {
  const ficha = fichas.find(f => f.id === id)

  if (!ficha) return

  setFichas(prev => prev.filter(f => f.id !== id))

  const { error } = await supabase
    .from('fichas')
    .delete()
    .eq('id', ficha.dbId)

  if (error) {
    console.error('[Supabase] Erro ao excluir:', error)
  }
  }, [fichas])

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
};
