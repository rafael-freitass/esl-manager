import type { Product, ShelfLabel } from '../../types/index.ts'
import { formatPrice } from '../../utils/formatPrice.ts'
import { Button } from '../Button.tsx'
import { Icon } from '../Icon.tsx'
import { Modal } from '../Modal.tsx'

type RemoveAssociationDialogProps = {
  label: ShelfLabel
  products: Product[]
  busy: boolean
  error: string | null
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function RemoveAssociationDialog({
  label,
  products,
  onClose,
  busy,
  error,
  onConfirm,
}: RemoveAssociationDialogProps) {
  const associatedProduct = products.find(
    (product) => product.code === label.productCode,
  )

  return (
    <Modal
      title="Remover associação"
      description="A etiqueta ficará disponível para outro produto."
      onClose={onClose}
      busy={busy}
      error={error}
    >
      <div className="confirmation-content">
        <div className="confirmation-icon">
          <Icon name="unlink" size={22} />
        </div>
        <p>
          Remover a associação entre <strong>{label.name}</strong> (
          {label.identifier}) e o produto abaixo?
        </p>
        {associatedProduct && (
          <div className="associated-product-card">
            <div>
              <strong>{associatedProduct.name}</strong>
              <span>{associatedProduct.code}</span>
            </div>
            <strong>{formatPrice(associatedProduct.price)}</strong>
          </div>
        )}
      </div>
      <div className="modal-actions">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={() => {
            void onConfirm()
          }}
        >
          Remover associação
        </Button>
      </div>
    </Modal>
  )
}
