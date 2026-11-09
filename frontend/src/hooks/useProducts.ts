import type { Product } from '../types/index.ts'
import { ApiError } from '../config/api.ts'
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from '../services/eslManagerApi.ts'
import { useApiList } from './useApiList.ts'

const sortProducts = (products: Product[]) =>
  products.sort((first, second) =>
    first.name.localeCompare(second.name, 'pt-BR'),
  )

export function useProducts() {
  const list = useApiList(listProducts)

  const mutate = async (
    operation: () => Promise<Product | void>,
    deletedCode?: string,
  ) => {
    list.beginMutation()
    let saved = false
    try {
      const result = await operation()
      list.setItems((current) =>
        result
          ? sortProducts([
              ...current.filter((product) => product.code !== result.code),
              result,
            ])
          : current.filter((product) => product.code !== deletedCode),
      )
      saved = true
    } finally {
      list.endMutation()
      const refreshed = await list.refresh()
      if (saved && !refreshed) {
        list.setError(
          'Alteração salva, mas não foi possível atualizar o catálogo. Use Atualizar lista para consultar o estado atual.',
        )
      }
    }
  }

  const removeProduct = async (productCode: string) => {
    try {
      await mutate(() => deleteProduct(productCode), productCode)
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 409) {
        throw new Error(
          'Este produto está associado a etiquetas. Desassocie todas as etiquetas antes de excluí-lo.',
          { cause },
        )
      }
      throw cause
    }
  }

  return {
    products: list.items,
    loading: list.loading,
    refreshing: list.refreshing,
    error: list.error,
    refreshProducts: list.refresh,
    updateDetails: (code: string, name: string, price: number) =>
      mutate(() => updateProduct(code, name, price)),
    addProduct: (code: string, name: string, price: number) =>
      mutate(() => createProduct(code, name, price)),
    removeProduct,
  }
}
