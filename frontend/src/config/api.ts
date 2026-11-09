const apiBaseUrl = import.meta.env.VITE_API_URL || ''

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const controller = new AbortController()
  const abort = () => controller.abort(options?.signal?.reason)
  options?.signal?.addEventListener('abort', abort, { once: true })
  if (options?.signal?.aborted) abort()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, 15000)
  try {
    const headers = new Headers(options?.headers)
    if (options?.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}${path}`, {
      ...options,
      signal: controller.signal,
      headers,
    })

    if (!response.ok) {
      const body = await response.json().catch(() => null)
      throw new ApiError(
        body?.detail ??
          body?.message ??
          `Falha na comunicação com o servidor (${response.status}).`,
        response.status,
      )
    }

    if (response.status === 204) return undefined as T
    return (await response.json()) as T
  } catch (cause) {
    if (timedOut) {
      throw new Error(
        'O servidor demorou para responder. Atualize a lista para verificar o resultado antes de repetir a operação.',
        { cause },
      )
    }
    if (controller.signal.aborted || cause instanceof ApiError) throw cause
    if (cause instanceof TypeError) {
      throw new Error(
        'Não foi possível conectar ao servidor. Verifique a conexão e tente atualizar a lista.',
        { cause },
      )
    }
    throw cause
  } finally {
    clearTimeout(timer)
    options?.signal?.removeEventListener('abort', abort)
  }
}
