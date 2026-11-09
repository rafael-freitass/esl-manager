import { useEffect, useRef, useState } from 'react'
import type { LabelDialogState } from '../types/label-dialog.ts'
import type { ShelfLabel } from '../types/index.ts'
import { useLabels } from './useLabels.ts'

export function useLabelManagement() {
  const {
    labels,
    counts,
    loading,
    refreshing,
    error,
    refreshLabels,
    beginProductUpdate,
    endProductUpdate,
    createLabel: addLabel,
    updateLabel,
    deleteLabel,
    associateProduct,
    removeAssociation,
  } = useLabels()
  const [dialog, setDialog] = useState<LabelDialogState | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimeout = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (toastTimeout.current !== null)
        window.clearTimeout(toastTimeout.current)
    },
    [],
  )

  const notify = (message: string) => {
    if (toastTimeout.current !== null) window.clearTimeout(toastTimeout.current)
    setToast(message)
    toastTimeout.current = window.setTimeout(() => {
      setToast(null)
      toastTimeout.current = null
    }, 2600)
  }

  const openCreateDialog = () => setDialog({ type: 'create' })
  const openLabelDialog = (
    type: Exclude<LabelDialogState['type'], 'create'>,
    label: ShelfLabel,
  ) => setDialog({ type, label })
  const closeDialog = () => setDialog(null)

  const createLabel = async (name: string, identifier: string) => {
    if (!name.trim() || !identifier.trim()) return false
    const saved = await addLabel(name, identifier)
    if (saved) notify('Etiqueta criada com sucesso.')
    return saved
  }

  const editLabel = async (
    labelId: number,
    name: string,
    identifier: string,
  ) => {
    if (!name.trim() || !identifier.trim()) return false
    const label = labels.find((item) => item.id === labelId)
    if (!label) return false
    const saved = await updateLabel(label, name, identifier)
    if (saved) notify('Etiqueta atualizada com sucesso.')
    return saved
  }

  const removeLabel = async (labelId: number) => {
    const removed = await deleteLabel(labelId)
    if (removed) notify('Etiqueta excluída com sucesso.')
    return removed
  }

  const linkProduct = async (labelId: number, productCode: string) => {
    const linked = await associateProduct(labelId, productCode)
    if (linked) notify('Produto associado com sucesso.')
    return linked
  }

  const unlinkProduct = async (labelId: number) => {
    const unlinked = await removeAssociation(labelId)
    if (unlinked) notify('Associação removida com sucesso.')
    return unlinked
  }

  const currentDialog =
    dialog && dialog.type !== 'create'
      ? {
          ...dialog,
          label: labels.find((label) => label.id === dialog.label.id) ?? {
            ...dialog.label,
            canDelete: false,
            deletionBlockReason:
              'A etiqueta não está mais na lista. Feche o diálogo e atualize a consulta.',
          },
        }
      : dialog

  return {
    labels,
    counts,
    loading,
    refreshing,
    error,
    dialog: currentDialog,
    toast,
    refreshLabels,
    beginProductUpdate,
    endProductUpdate,
    openCreateDialog,
    openLabelDialog,
    closeDialog,
    createLabel,
    editLabel,
    removeLabel,
    linkProduct,
    unlinkProduct,
  }
}
