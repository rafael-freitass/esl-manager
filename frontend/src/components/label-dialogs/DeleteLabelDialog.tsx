import type { ShelfLabel } from '../../types/index.ts'
import { Button } from '../Button.tsx'
import { Icon } from '../Icon.tsx'
import { Modal } from '../Modal.tsx'

type DeleteLabelDialogProps = {
  label: ShelfLabel
  busy: boolean
  error: string | null
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function DeleteLabelDialog({
  label,
  onClose,
  busy,
  error,
  onConfirm,
}: DeleteLabelDialogProps) {
  return (
    <Modal
      title="Excluir etiqueta"
      description="Esta ação não poderá ser desfeita."
      onClose={onClose}
      busy={busy}
      error={error}
    >
      <div className="confirmation-content">
        <div className="confirmation-icon danger">
          <Icon name="trash" size={22} />
        </div>
        <p>
          Tem certeza que deseja excluir a etiqueta{' '}
          <strong>{label.name}</strong> ({label.identifier})?
        </p>
        {!label.canDelete && (
          <div className="warning-note">
            {label.deletionBlockReason ??
              'Aguarde a confirmação de limpeza antes de excluir.'}
          </div>
        )}
      </div>
      <div className="modal-actions">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="danger"
          disabled={busy || !label.canDelete}
          onClick={() => {
            void onConfirm()
          }}
        >
          Excluir etiqueta
        </Button>
      </div>
    </Modal>
  )
}
