import type { Product, ShelfLabel } from '../../types'
import { formatPrice } from '../../utils/formatPrice'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { Modal } from '../Modal'

type RemoveAssociationDialogProps = {
  label: ShelfLabel
  products: Product[]
  onClose: () => void
  onConfirm: () => void
}

export function RemoveAssociationDialog({
  label,
  products,
  onClose,
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
    >
      <div className="confirmation-content">
        <div className="confirmation-icon">
          <Icon name="unlink" size={22} />
        </div>
        <p>
          Remover a associação entre <strong>{label.identifier}</strong> e o
          produto abaixo?
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
            onConfirm()
            onClose()
          }}
        >
          Remover associação
        </Button>
      </div>
    </Modal>
  )
}
