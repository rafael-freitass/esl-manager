import { useCallback, useEffect, useRef, useState } from 'react'

// Uma consulta vigente por lista: respostas antigas nunca substituem dados novos.
export function useApiList<T>(load: (signal?: AbortSignal) => Promise<T[]>) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const current = useRef<AbortController | null>(null)
  const mounted = useRef(false)
  const mutations = useRef(0)

  const refresh = useCallback(async () => {
    if (!mounted.current || mutations.current > 0) return false
    current.current?.abort()
    const controller = new AbortController()
    current.current = controller
    setRefreshing(true)
    try {
      const result = await load(controller.signal)
      if (controller.signal.aborted || !mounted.current) return false
      setItems(result)
      setError(null)
      return true
    } catch (cause) {
      if (!controller.signal.aborted && mounted.current) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'Não foi possível atualizar a lista.',
        )
      }
      return false
    } finally {
      if (current.current === controller && mounted.current) {
        current.current = null
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [load])

  // Suspende leituras durante gravações para não restaurar um snapshot anterior.
  const beginMutation = () => {
    mutations.current += 1
    current.current?.abort()
  }
  const endMutation = () => {
    mutations.current -= 1
  }

  useEffect(() => {
    mounted.current = true
    const initial = window.setTimeout(() => void refresh(), 0)
    const timer = window.setInterval(() => {
      if (!document.hidden && !current.current && mutations.current === 0)
        void refresh()
    }, 5000)
    const onFocus = () => {
      if (!document.hidden && !current.current) void refresh()
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      mounted.current = false
      current.current?.abort()
      current.current = null
      window.clearInterval(timer)
      window.clearTimeout(initial)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [refresh])

  return {
    items,
    setItems,
    loading,
    refreshing,
    error,
    setError,
    refresh,
    beginMutation,
    endMutation,
  }
}
