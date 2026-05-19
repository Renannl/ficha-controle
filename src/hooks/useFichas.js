import { useState, useCallback, useEffect, useMemo } from 'react'
import { createEmptyFicha } from '../data/fichaTemplate'
import { supabase } from '../lib/supabase'
import { useRef } from 'react'

export function useFichas(currentUser) {
  const [fichas, setFichas] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  const saveTimeouts = useRef({})

  useEffect(() => {
    async function loadFichas() {
      const { data, error } = await supabase
        .from('fichas')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[Supabase] Erro ao carregar fichas:', error)
      } else {
        const fichasConvertidas = data.map(f => ({
          ...f.dados,

          userId: f.user_id,
          criadoPor: f.criado_por,

          dbId: f.id,
          created_at: f.created_at,
          updated_at: f.updated_at,
        }))

        setFichas(fichasConvertidas)
      }

      setIsLoaded(true)
    }

    loadFichas()
  }, [])

  async function gerarCodigo(operacao) {
  const prefixos = {
    '10': 'PRO',
    '50': 'TAF',
    '80': 'INDUS',
    '90': 'QUA',
  }

  const prefixo = prefixos[operacao] || 'GEN'

  // Busca último código dessa operação
  const { data, error } = await supabase
    .from('fichas')
    .select('codigo')
    .eq('operacao', operacao)
    .like('codigo', `${prefixo}-%`)
    .order('codigo', { ascending: false })
    .limit(1)

  if (error) {
    console.error(error)
    return `${prefixo}-0001`
  }

  let numero = 1

  if (data.length > 0) {
    const ultimoCodigo = data[0].codigo

    const ultimoNumero = parseInt(
      ultimoCodigo.split('-')[1]
    )

    numero = ultimoNumero + 1
  }

  return `${prefixo}-${String(numero).padStart(4, '0')}`
}

  // ─────────────────────────────────────────────
  // REALTIME
  // ─────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('fichas-realtime')

      // INSERT
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fichas',
        },
        payload => {
          const novaFicha = {
            ...payload.new.dados,

            userId: payload.new.user_id,
            criadoPor: payload.new.criado_por,

            dbId: payload.new.id,
            created_at: payload.new.created_at,
            updated_at: payload.new.updated_at,
          }

          setFichas(prev => {
            const existe = prev.some(f => f.dbId === novaFicha.dbId)

            if (existe) return prev

            return [novaFicha, ...prev]
          })
        }
      )

      // UPDATE
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'fichas',
        },
        payload => {

          // SOFT DELETE
          if (payload.new.deleted_at) {
            setFichas(prev =>
              prev.filter(
                f => f.dbId !== payload.new.id
              )
            )

            return
          }

          // UPDATE NORMAL
          const fichaAtualizada = {
            ...payload.new.dados,
            userId: payload.new.user_id,
            criadoPor: payload.new.criado_por,
            dbId: payload.new.id,
            created_at: payload.new.created_at,
            updated_at: payload.new.updated_at,
          }

          setFichas(prev =>
            prev.map(f =>
              f.dbId === fichaAtualizada.dbId
                ? fichaAtualizada
                : f
            )
          )
        }
      )

      // DELETE
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'fichas',
        },
        payload => {
          setFichas(prev =>
            prev.filter(f => f.dbId !== payload.old.id)
          )
        }
      )

      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // ─────────────────────────────────────────────
  // CRIAR
  // ─────────────────────────────────────────────
  const criarFicha = useCallback(async (operacaoCodigo) => {
    const codigoGerado = await gerarCodigo(operacaoCodigo)

    const nova = {
      ...createEmptyFicha(operacaoCodigo),
      codigo: codigoGerado,
      criadoPor:
        currentUser?.nome ||
        currentUser?.username ||
        'Sistema',

      userId:
        currentUser?.username ||
        'system'
    }

    const { data, error } = await supabase
      .from('fichas')
      .insert({
        codigo: nova.codigo,
        operacao: nova.operacao,
        status: nova.status,
        criado_por: nova.criadoPor,
        user_id: nova.userId,
        dados: nova
      })
      .select('*')
      .is('deleted_at', null)
      .single()

    if (error) {
      console.error('[Supabase] Erro ao criar ficha:', error)
      alert('Erro ao criar ficha.')
      return null
    }

    return data.dados.id
  }, [currentUser])

  // ─────────────────────────────────────────────
  // ATUALIZAR
  // ─────────────────────────────────────────────
  const atualizarFicha = useCallback((id, updater) => {
  const fichaAtual = fichas.find(f => f.id === id)

  if (!fichaAtual) return

  const fichaAtualizada =
    typeof updater === 'function'
      ? updater(fichaAtual)
      : { ...fichaAtual, ...updater }

  // Atualiza instantaneamente na tela
  setFichas(prev =>
    prev.map(f =>
      f.id === id
        ? fichaAtualizada
        : f
    )
  )

  // Cancela save anterior
  if (saveTimeouts.current[id]) {
    clearTimeout(saveTimeouts.current[id])
  }

  // Aguarda usuário parar de digitar
  saveTimeouts.current[id] = setTimeout(async () => {
    const { error } = await supabase
      .from('fichas')
      .update({
        operacao: fichaAtualizada.operacao,
        status: fichaAtualizada.status,
        criado_por: fichaAtualizada.criadoPor,
        user_id: fichaAtualizada.userId,
        dados: {
              ...fichaAtualizada,
              userId: fichaAtualizada.userId,
              criadoPor: fichaAtualizada.criadoPor,
            },
      })
      .eq('id', fichaAtual.dbId)

    if (error) {
      console.error('[Supabase] Erro ao atualizar ficha:', error)
    }

    delete saveTimeouts.current[id]
  }, 8000)

  }, [fichas])

  // ─────────────────────────────────────────────
  // EXCLUIR
  // ─────────────────────────────────────────────
  const excluirFicha = useCallback(async (id) => {
  const ficha = fichas.find(f => f.id === id)

  if (!ficha) return

  // remove da interface
  setFichas(prev =>
    prev.filter(f => f.id !== id)
  )

  // soft delete
  const { error } = await supabase
    .from('fichas')
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: currentUser?.username
    })
    .eq('id', ficha.dbId)

  if (error) {
    console.error(
      '[Supabase] Erro ao mover para lixeira:',
      error
    )
  }}, [fichas])

  // ─────────────────────────────────────────────
  // PERMISSÕES
  // ─────────────────────────────────────────────
const visibleFichas = useMemo(() => {
  if (!currentUser) return []

  const permissoes = currentUser.permissoes || []

  const podeVerTudo =
    currentUser.role === 'admin' ||
    permissoes.includes('ver_tudo')

  if (podeVerTudo) {
    return fichas
  }

  const verAprovacao = permissoes.includes('ver_aprovacao')
  const verEnviadas = permissoes.includes('ver_enviadas')

  const resultado = []

  // sempre começa com minhas fichas
  resultado.push(
    ...fichas.filter(f => f.userId === currentUser.username)
  )

  // pendentes de aprovação
  if (verAprovacao) {
    resultado.push(
      ...fichas.filter(f => f.statusAprovacao === 'aguardando')
    )
  }

  // enviadas (aprovadas/rejeitadas)
  if (verEnviadas) {
    resultado.push(
      ...fichas.filter(f =>
        f.statusAprovacao === 'aprovado' ||
        f.statusAprovacao === 'reprovado'
      )
    )
  }

  // remove duplicados
  const unique = new Map()
  resultado.forEach(f => unique.set(f.id, f))

  return Array.from(unique.values())
}, [fichas, currentUser])

const getFicha = useCallback((id) => {
  return visibleFichas.find(
    f => f.id === id
  ) || null
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