import { useState } from 'react'
import labelsData from '../data/labels.json'
import type { ShelfLabel } from '../types'

const initialLabels = labelsData as ShelfLabel[]

export function useLabels() {
  const [labels, setLabels] = useState<ShelfLabel[]>(initialLabels)

  const counts = {
    total: labels.length,
    available: labels.filter((label) => label.status === 'available').length,
    associated: labels.filter((label) => label.status === 'associated').length,
  }

  const createLabel = (identifier: string) => {
    const normalizedIdentifier = identifier.trim().toUpperCase()
    if (
      labels.some(
        (label) => label.identifier.toUpperCase() === normalizedIdentifier,
      )
    ) {
      return false
    }

    setLabels((current) => [
      ...current,
      {
        id:
          current.reduce(
            (highestId, label) => Math.max(highestId, label.id),
            0,
          ) + 1,
        identifier: normalizedIdentifier,
        status: 'available',
      },
    ])
    return true
  }

  const updateLabel = (id: number, identifier: string) => {
    const normalizedIdentifier = identifier.trim().toUpperCase()
    if (
      labels.some(
        (label) =>
          label.id !== id &&
          label.identifier.toUpperCase() === normalizedIdentifier,
      )
    ) {
      return false
    }

    setLabels((current) =>
      current.map((label) =>
        label.id === id
          ? { ...label, identifier: normalizedIdentifier }
          : label,
      ),
    )
    return true
  }

  const deleteLabel = (id: number) => {
    setLabels((current) => current.filter((label) => label.id !== id))
  }

  const associateProduct = (id: number, productCode: string) => {
    setLabels((current) =>
      current.map((label) =>
        label.id === id
          ? { ...label, status: 'associated', productCode }
          : label,
      ),
    )
  }

  const removeAssociation = (id: number) => {
    setLabels((current) =>
      current.map((label) =>
        label.id === id
          ? { ...label, status: 'available', productCode: undefined }
          : label,
      ),
    )
  }

  return {
    labels,
    counts,
    createLabel,
    updateLabel,
    deleteLabel,
    associateProduct,
    removeAssociation,
  }
}
