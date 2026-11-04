import type { ShelfLabel } from '../../types'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { Modal } from '../Modal'

type DeleteLabelDialogProps = {
  label: ShelfLabel
  onClose: () => void
  onConfirm: () => void
}

export function DeleteLabelDialog({
  label,
  onClose,
  onConfirm,
}: DeleteLabelDialogProps) {
  return (
    <Modal
      title="Excluir etiqueta"
      description="Esta ação não poderá ser desfeita."
      onClose={onClose}
    >
      <div className="confirmation-content">
        <div className="confirmation-icon danger">
          <Icon name="trash" size={22} />
        </div>
        <p>
          Tem certeza que deseja excluir a etiqueta{' '}
          <strong>{label.identifier}</strong>?
        </p>
        {label.status === 'associated' && (
          <div className="warning-note">
            A associação atual com um produto também será removida.
          </div>
        )}
      </div>
      <div className="modal-actions">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            onConfirm()
            onClose()
          }}
        >
          Excluir etiqueta
        </Button>
      </div>
    </Modal>
  )
}
