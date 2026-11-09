import type { ShelfLabel } from '../types/index.ts'
import {
  associateLabel,
  createLabel as createLabelRequest,
  deleteLabel as deleteLabelRequest,
  listLabels,
  removeLabelAssociation,
  updateLabel as updateLabelRequest,
} from '../services/eslManagerApi.ts'
import { useApiList } from './useApiList.ts'

export function useLabels() {
  const list = useApiList(listLabels)
  const labels = list.items

  const runMutation = async (
    operation: () => Promise<ShelfLabel | void>,
    deletedId?: number,
  ) => {
    list.beginMutation()
    let saved = false
    try {
      const result = await operation()
      list.setItems((current) =>
        result
          ? [...current.filter((label) => label.id !== result.id), result]
          : current.filter((label) => label.id !== deletedId),
      )
      saved = true
    } finally {
      list.endMutation()
      const refreshed = await list.refresh()
      if (saved && !refreshed) {
        list.setError(
          'Alteração salva, mas não foi possível atualizar a lista de etiquetas. Use Atualizar lista para consultar o estado atual.',
        )
      }
    }
    return true
  }

  return {
    labels,
    counts: {
      total: labels.length,
      available: labels.filter((label) => label.status === 'available').length,
      associated: labels.filter((label) => label.status === 'associated')
        .length,
    },
    loading: list.loading,
    refreshing: list.refreshing,
    error: list.error,
    refreshLabels: list.refresh,
    beginProductUpdate: (code: string) => {
      list.beginMutation()
      list.setItems((current) =>
        current.map((label) =>
          label.productCode === code
            ? {
                ...label,
                syncStatus: 'pending',
                syncError: null,
                canDelete: false,
              }
            : label,
        ),
      )
    },
    endProductUpdate: async (code: string, changed: boolean) => {
      if (changed)
        list.setItems((current) =>
          current.map((label) =>
            label.productCode === code
              ? {
                  ...label,
                  syncStatus: 'pending',
                  syncError: null,
                  canDelete: false,
                }
              : label,
          ),
        )
      list.endMutation()
      await list.refresh()
    },
    createLabel: (name: string, identifier: string) =>
      runMutation(() => createLabelRequest(name, identifier)),
    updateLabel: (label: ShelfLabel, name: string, identifier: string) =>
      runMutation(() => updateLabelRequest(label, name, identifier)),
    deleteLabel: (id: number) => runMutation(() => deleteLabelRequest(id), id),
    associateProduct: (id: number, code: string) =>
      runMutation(() => associateLabel(id, code)),
    removeAssociation: (id: number) =>
      runMutation(() => removeLabelAssociation(id)),
  }
}
