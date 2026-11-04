import { useState } from 'react'
import type { SubmitEvent } from 'react'
import type { Product } from '../types'
import type { LabelDialogState } from '../types/label-dialog'
import { AssociateProductDialog } from './label-dialogs/AssociateProductDialog'
import { DeleteLabelDialog } from './label-dialogs/DeleteLabelDialog'
import { RemoveAssociationDialog } from './label-dialogs/RemoveAssociationDialog'
import { LabelFormModal } from './LabelFormModal'

export type { LabelDialogState } from '../types/label-dialog'

type LabelDialogsProps = {
  dialog: LabelDialogState
  products: Product[]
  onClose: () => void
  onCreate: (identifier: string) => boolean
  onEdit: (labelId: number, identifier: string) => boolean
  onDelete: (labelId: number) => void
  onAssociate: (labelId: number, productCode: string) => void
  onRemoveAssociation: (labelId: number) => void
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
  const [identifier, setIdentifier] = useState(
    dialog.type === 'edit' ? dialog.label.identifier : '',
  )

  if (dialog.type === 'create' || dialog.type === 'edit') {
    const isEditing = dialog.type === 'edit'
    const submitForm = (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault()
      const saved = isEditing
        ? onEdit(dialog.label.id, identifier)
        : onCreate(identifier)
      if (saved) onClose()
    }

    return (
      <LabelFormModal
        title={isEditing ? 'Editar etiqueta' : 'Criar nova etiqueta'}
        description={
          isEditing
            ? 'Atualize o identificador da etiqueta selecionada.'
            : 'Cadastre um identificador único para a etiqueta.'
        }
        value={identifier}
        setValue={setIdentifier}
        onClose={onClose}
        onSubmit={submitForm}
        submitLabel={isEditing ? 'Salvar alterações' : 'Criar etiqueta'}
      />
    )
  }

  if (dialog.type === 'delete') {
    return (
      <DeleteLabelDialog
        label={dialog.label}
        onClose={onClose}
        onConfirm={() => onDelete(dialog.label.id)}
      />
    )
  }

  if (dialog.type === 'associate') {
    return (
      <AssociateProductDialog
        label={dialog.label}
        products={products}
        onClose={onClose}
        onConfirm={(productCode) => onAssociate(dialog.label.id, productCode)}
      />
    )
  }

  return (
    <RemoveAssociationDialog
      label={dialog.label}
      products={products}
      onClose={onClose}
      onConfirm={() => onRemoveAssociation(dialog.label.id)}
    />
  )
}
