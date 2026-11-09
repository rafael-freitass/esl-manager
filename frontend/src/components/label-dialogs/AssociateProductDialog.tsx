import { useState } from 'react'
import type { Product, ShelfLabel } from '../../types/index.ts'
import { formatPrice } from '../../utils/formatPrice.ts'
import { Button } from '../Button.tsx'
import { Icon } from '../Icon.tsx'
import { Modal } from '../Modal.tsx'

type AssociateProductDialogProps = {
  label: ShelfLabel
  products: Product[]
  busy: boolean
  error: string | null
  onClose: () => void
  onConfirm: (productCode: string) => Promise<void>
}

export function AssociateProductDialog({
  label,
  products,
  onClose,
  busy,
  error,
  onConfirm,
}: AssociateProductDialogProps) {
  const [search, setSearch] = useState('')
  const [selectedProductCode, setSelectedProductCode] = useState<string | null>(
    null,
  )
  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR')
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
      product.code.toLocaleLowerCase('pt-BR').includes(normalizedSearch),
  )

  return (
    <Modal
      title="Associar produto"
      description={`Selecione um produto para ${label.name} (${label.identifier}).`}
      onClose={onClose}
      busy={busy}
      error={error}
      width="wide"
    >
      <div className="modal-body associate-body">
        <div className="search-field">
          <Icon name="search" size={17} />
          <input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome ou código..."
            aria-label="Buscar produto para associação"
          />
        </div>
        <div className="product-options">
          {filteredProducts.map((product) => (
            <button
              key={product.code}
              type="button"
              className={`product-option ${
                selectedProductCode === product.code ? 'selected' : ''
              }`}
              aria-pressed={selectedProductCode === product.code}
              onClick={() => setSelectedProductCode(product.code)}
            >
              <span className="radio" aria-hidden="true">
                {selectedProductCode === product.code && <span />}
              </span>
              <span className="product-option-copy">
                <strong>{product.name}</strong>
                <small>{product.code}</small>
              </span>
              <strong className="option-price">
                {formatPrice(product.price)}
              </strong>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <div className="small-empty">Nenhum produto encontrado.</div>
          )}
        </div>
      </div>
      <div className="modal-actions">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          disabled={!selectedProductCode}
          onClick={() => {
            if (!selectedProductCode) return
            void onConfirm(selectedProductCode)
          }}
        >
          Confirmar associação
        </Button>
      </div>
    </Modal>
  )
}
