import { useEffect, useRef, useState } from 'react'
import type { LabelDialogState } from '../types/label-dialog'
import type { ShelfLabel } from '../types'
import { useLabels } from './useLabels'

export function useLabelManagement() {
  const {
    labels,
    counts,
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
      if (toastTimeout.current !== null) {
        window.clearTimeout(toastTimeout.current)
      }
    },
    [],
  )

  const notify = (message: string) => {
    if (toastTimeout.current !== null) {
      window.clearTimeout(toastTimeout.current)
    }
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

  const createLabel = (identifier: string) => {
    if (!identifier.trim()) return false
    if (!addLabel(identifier)) {
      notify('Já existe uma etiqueta com este identificador.')
      return false
    }

    notify('Etiqueta criada com sucesso.')
    return true
  }

  const editLabel = (labelId: number, identifier: string) => {
    if (!identifier.trim()) return false
    if (!updateLabel(labelId, identifier)) {
      notify('Já existe uma etiqueta com este identificador.')
      return false
    }

    notify('Etiqueta atualizada com sucesso.')
    return true
  }

  const removeLabel = (labelId: number) => {
    deleteLabel(labelId)
    notify('Etiqueta excluída com sucesso.')
  }

  const linkProduct = (labelId: number, productCode: string) => {
    associateProduct(labelId, productCode)
    notify('Produto associado com sucesso.')
  }

  const unlinkProduct = (labelId: number) => {
    removeAssociation(labelId)
    notify('Associação removida com sucesso.')
  }

  return {
    labels,
    counts,
    dialog,
    toast,
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
