import { apiRequest } from '../config/api.ts'
import type { Product, ShelfLabel } from '../types/index.ts'

type ApiProduct = {
  codigoBarras: string
  nome: string
  preco: number
}

type ApiLabel = {
  id: number
  nome: string
  codigoDispositivo: string
  status: 'DISPONIVEL' | 'ASSOCIADA'
  statusAtualizacao: 'PENDENTE' | 'ENVIANDO' | 'ATUALIZADA' | 'ERRO'
  erroAtualizacao: string | null
  aguardandoRegistro: boolean
  podeExcluir: boolean
  motivoBloqueioExclusao: string | null
  codigoBarrasProduto: string | null
}

const mapProduct = (product: ApiProduct): Product => ({
  code: product.codigoBarras,
  name: product.nome,
  price: product.preco,
})

const mapLabel = (label: ApiLabel): ShelfLabel => ({
  id: label.id,
  name: label.nome,
  identifier: label.codigoDispositivo,
  status: label.status === 'ASSOCIADA' ? 'associated' : 'available',
  syncStatus: (
    {
      PENDENTE: 'pending',
      ENVIANDO: 'sending',
      ATUALIZADA: 'updated',
      ERRO: 'error',
    } as const
  )[label.statusAtualizacao],
  syncError: label.erroAtualizacao,
  awaitingRegistration: label.aguardandoRegistro,
  canDelete: label.podeExcluir,
  deletionBlockReason: label.motivoBloqueioExclusao,
  productCode: label.codigoBarrasProduto ?? undefined,
})

export async function listProducts(signal?: AbortSignal): Promise<Product[]> {
  const products = await apiRequest<ApiProduct[]>('/api/produtos', { signal })
  return products.map(mapProduct)
}

export async function updateProduct(
  productCode: string,
  name: string,
  price: number,
): Promise<Product> {
  const product = await apiRequest<ApiProduct>(
    `/api/produtos/${encodeURIComponent(productCode)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ nome: name, preco: price }),
    },
  )
  return mapProduct(product)
}

export async function createProduct(
  productCode: string,
  name: string,
  price: number,
): Promise<Product> {
  const product = await apiRequest<ApiProduct>('/api/produtos', {
    method: 'POST',
    body: JSON.stringify({
      codigoBarras: productCode,
      nome: name,
      preco: price,
    }),
  })
  return mapProduct(product)
}

export async function deleteProduct(productCode: string): Promise<void> {
  await apiRequest<void>(`/api/produtos/${encodeURIComponent(productCode)}`, {
    method: 'DELETE',
  })
}

export async function listLabels(signal?: AbortSignal): Promise<ShelfLabel[]> {
  const labels = await apiRequest<ApiLabel[]>('/api/etiquetas', { signal })
  return labels.map(mapLabel)
}

export async function createLabel(
  name: string,
  identifier: string,
): Promise<ShelfLabel> {
  const label = await apiRequest<ApiLabel>('/api/etiquetas', {
    method: 'POST',
    body: JSON.stringify({ nome: name, codigoDispositivo: identifier }),
  })
  return mapLabel(label)
}

export async function updateLabel(
  label: ShelfLabel,
  name: string,
  identifier: string,
): Promise<ShelfLabel> {
  const updated = await apiRequest<ApiLabel>(`/api/etiquetas/${label.id}`, {
    method: 'PUT',
    body: JSON.stringify({ nome: name, codigoDispositivo: identifier }),
  })
  return mapLabel(updated)
}

export async function deleteLabel(labelId: number): Promise<void> {
  await apiRequest<void>(`/api/etiquetas/${labelId}`, { method: 'DELETE' })
}

export async function associateLabel(
  labelId: number,
  productCode: string,
): Promise<ShelfLabel> {
  const label = await apiRequest<ApiLabel>(
    `/api/etiquetas/${labelId}/produto`,
    {
      method: 'PUT',
      body: JSON.stringify({ codigoBarras: productCode }),
    },
  )
  return mapLabel(label)
}

export async function removeLabelAssociation(
  labelId: number,
): Promise<ShelfLabel> {
  const label = await apiRequest<ApiLabel>(
    `/api/etiquetas/${labelId}/produto`,
    {
      method: 'DELETE',
    },
  )
  return mapLabel(label)
}
