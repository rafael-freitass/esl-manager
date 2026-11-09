import { useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import type { Product } from '../types/index.ts'
import type { LabelDialogState } from '../types/label-dialog.ts'
import { AssociateProductDialog } from './label-dialogs/AssociateProductDialog.tsx'
import { DeleteLabelDialog } from './label-dialogs/DeleteLabelDialog.tsx'
import { RemoveAssociationDialog } from './label-dialogs/RemoveAssociationDialog.tsx'
import { LabelFormModal } from './LabelFormModal.tsx'

type LabelDialogsProps = {
  dialog: LabelDialogState
  products: Product[]
  onClose: () => void
  onCreate: (name: string, identifier: string) => Promise<boolean>
  onEdit: (
    labelId: number,
    name: string,
    identifier: string,
  ) => Promise<boolean>
  onDelete: (labelId: number) => Promise<boolean>
  onAssociate: (labelId: number, productCode: string) => Promise<boolean>
  onRemoveAssociation: (labelId: number) => Promise<boolean>
}

export function LabelDialogs({
  dialog,
  products,
  onClose,
  onCreate,
  onEdit,
  onDelete,
  onAssociate,
  onRemoveAssociation,
}: LabelDialogsProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inFlight = useRef(false)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const close = () => {
    if (!inFlight.current) onClose()
  }
  const run = async (operation: () => Promise<boolean>) => {
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setError(null)
    try {
      const saved = await operation()
      if (saved && mounted.current) onClose()
    } catch (cause) {
      if (mounted.current)
        setError(
          cause instanceof Error
            ? cause.message
            : 'Não foi possível salvar a alteração.',
        )
    } finally {
      inFlight.current = false
      if (mounted.current) setBusy(false)
    }
  }
  const [name, setName] = useState(
    dialog.type === 'edit' ? dialog.label.name : '',
  )
  const [identifier, setIdentifier] = useState(
    dialog.type === 'edit' ? dialog.label.identifier : '',
  )

  if (dialog.type === 'create' || dialog.type === 'edit') {
    const isEditing = dialog.type === 'edit'
    const submitForm = async (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault()
      await run(() =>
        isEditing
          ? onEdit(dialog.label.id, name, identifier)
          : onCreate(name, identifier),
      )
    }

    return (
      <LabelFormModal
        title={isEditing ? 'Editar etiqueta' : 'Criar nova etiqueta'}
        description={
          isEditing
            ? 'Atualize o nome e o código da etiqueta selecionada.'
            : 'Informe um nome e um código único para a etiqueta.'
        }
        name={name}
        setName={setName}
        identifier={identifier}
        identifierBlockReason={
          isEditing && !dialog.label.canDelete
            ? (dialog.label.deletionBlockReason ??
              'Aguarde a confirmação de limpeza antes de trocar o código.')
            : null
        }
        setIdentifier={setIdentifier}
        onClose={close}
        busy={busy}
        error={error}
        onSubmit={submitForm}
        submitLabel={isEditing ? 'Salvar alterações' : 'Criar etiqueta'}
      />
    )
  }

  if (dialog.type === 'delete') {
    return (
      <DeleteLabelDialog
        label={dialog.label}
        onClose={close}
        busy={busy}
        error={error}
        onConfirm={() => run(() => onDelete(dialog.label.id))}
      />
    )
  }

  if (dialog.type === 'associate') {
    return (
      <AssociateProductDialog
        label={dialog.label}
        products={products}
        onClose={close}
        busy={busy}
        error={error}
        onConfirm={(productCode) =>
          run(() => onAssociate(dialog.label.id, productCode))
        }
      />
    )
  }

  return (
    <RemoveAssociationDialog
      label={dialog.label}
      products={products}
      onClose={close}
      busy={busy}
      error={error}
      onConfirm={() => run(() => onRemoveAssociation(dialog.label.id))}
    />
  )
}
