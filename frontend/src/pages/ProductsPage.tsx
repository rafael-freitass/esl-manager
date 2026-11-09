import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../components/Button.tsx'
import { EmptyState } from '../components/EmptyState.tsx'
import { Icon } from '../components/Icon.tsx'
import { Modal } from '../components/Modal.tsx'
import type { Product } from '../types/index.ts'
import { formatPrice } from '../utils/formatPrice.ts'

type ProductsPageProps = {
  onRefresh: () => Promise<void>
  refreshing: boolean
  products: Product[]
  onUpdateProduct: (
    productCode: string,
    name: string,
    price: number,
  ) => Promise<void>
  onCreateProduct: (
    productCode: string,
    name: string,
    price: number,
  ) => Promise<void>
  onDeleteProduct: (productCode: string) => Promise<void>
}

type ProductDialog =
  { type: 'create' } | { type: 'edit' | 'delete'; product: Product }

export function ProductsPage({
  products,
  onUpdateProduct,
  onCreateProduct,
  onDeleteProduct,
  onRefresh,
  refreshing,
}: ProductsPageProps) {
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState<ProductDialog | null>(null)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR')
  const visibleProducts = products.filter(
    (product) =>
      product.name.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
      product.code.toLocaleLowerCase('pt-BR').includes(normalizedSearch),
  )

  const openDialog = (next: ProductDialog) => {
    setDialog(next)
    setCode(next.type === 'create' ? '' : next.product.code)
    setName(next.type === 'create' ? '' : next.product.name)
    setPrice(next.type === 'create' ? '' : next.product.price.toFixed(2))
    setSaveError(null)
    setSavedMessage(null)
  }

  const closeDialog = () => {
    if (!saving) setDialog(null)
  }

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!dialog || dialog.type === 'delete' || saving) return
    const nextPrice = Number(price)
    if (!code.trim() || code.trim().length > 32) {
      setSaveError('Informe um código de barras com até 32 caracteres.')
      return
    }
    if (!name.trim() || name.trim().length > 120) {
      setSaveError('Informe um nome com até 120 caracteres.')
      return
    }
    if (
      !price.trim() ||
      !Number.isFinite(nextPrice) ||
      nextPrice < 0 ||
      nextPrice > 99999999.99 ||
      !/^\d+(\.\d{1,2})?$/.test(price)
    ) {
      setSaveError(
        'Informe um preço de 0 a 99.999.999,99, com até duas casas decimais.',
      )
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      if (dialog.type === 'create') {
        await onCreateProduct(code.trim(), name.trim(), nextPrice)
        setSavedMessage('Produto cadastrado com sucesso.')
      } else {
        await onUpdateProduct(dialog.product.code, name.trim(), nextPrice)
        setSavedMessage('Produto atualizado com sucesso.')
      }
      setDialog(null)
    } catch (cause) {
      setSaveError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar o produto.',
      )
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!dialog || dialog.type !== 'delete' || saving) return
    setSaving(true)
    setSaveError(null)
    try {
      await onDeleteProduct(dialog.product.code)
      setSavedMessage('Produto excluído com sucesso.')
      setDialog(null)
    } catch (cause) {
      setSaveError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível excluir o produto.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <div className="table-toolbar product-toolbar">
        <div className="search-field table-search product-search">
          <Icon name="search" size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome ou código..."
            aria-label="Buscar produtos"
          />
        </div>
        <div className="actions">
          <Button
            variant="secondary"
            disabled={refreshing || saving}
            onClick={() => void onRefresh()}
          >
            {refreshing ? 'Atualizando...' : 'Atualizar lista'}
          </Button>
          <Button onClick={() => openDialog({ type: 'create' })}>
            <Icon name="plus" size={17} />
            Novo produto
          </Button>
        </div>
      </div>
      <div className="table-card">
        <div className="table-card-header">
          <div>
            <h2>Catálogo de produtos</h2>
            <p>
              {visibleProducts.length}{' '}
              {visibleProducts.length === 1
                ? 'produto encontrado'
                : 'produtos encontrados'}
            </p>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome do produto</th>
                <th className="price-heading">Preço</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product) => (
                <tr key={product.code}>
                  <td>
                    <span className="product-code">{product.code}</span>
                  </td>
                  <td>
                    <div className="catalog-product">
                      <span className="package-mini-icon">
                        <Icon name="package" size={15} />
                      </span>
                      <strong>{product.name}</strong>
                    </div>
                  </td>
                  <td className="price-cell">{formatPrice(product.price)}</td>
                  <td className="product-actions">
                    <div className="actions">
                      <Button
                        variant="secondary"
                        onClick={() => openDialog({ type: 'edit', product })}
                      >
                        Editar dados
                      </Button>
                      <button
                        className="icon-button danger-icon"
                        onClick={() => openDialog({ type: 'delete', product })}
                        aria-label={`Excluir ${product.name}`}
                        title="Excluir produto"
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visibleProducts.length === 0 && (
          <EmptyState message="Nenhum produto encontrado." />
        )}
      </div>
      {savedMessage && (
        <p className="product-save-message" role="status">
          {savedMessage}
        </p>
      )}
      {dialog && dialog.type !== 'delete' && (
        <Modal
          title={
            dialog.type === 'create' ? 'Cadastrar produto' : 'Editar produto'
          }
          description={
            dialog.type === 'create'
              ? 'Informe os dados do novo produto.'
              : `${dialog.product.name} · código ${dialog.product.code}`
          }
          onClose={closeDialog}
        >
          <form className="product-form" onSubmit={saveProduct} noValidate>
            <div className="modal-body">
              <label className="field-label" htmlFor="product-code">
                Código de barras
              </label>
              <input
                id="product-code"
                className="text-input"
                type="text"
                maxLength={32}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                readOnly={dialog.type === 'edit'}
                disabled={saving}
                autoFocus={dialog.type === 'create'}
                required
              />
              <label className="field-label" htmlFor="product-name">
                Nome do produto
              </label>
              <input
                id="product-name"
                className="text-input"
                type="text"
                maxLength={120}
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoFocus={dialog.type === 'edit'}
                disabled={saving}
                required
              />
              <label className="field-label" htmlFor="product-price">
                Preço (R$)
              </label>
              <input
                id="product-price"
                className="text-input"
                type="number"
                min="0"
                max="99999999.99"
                step="0.01"
                inputMode="decimal"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                disabled={saving}
                required
              />
              {saveError && (
                <p className="form-error" role="alert">
                  {saveError}
                </p>
              )}
            </div>
            <div className="modal-actions">
              <Button
                variant="secondary"
                onClick={closeDialog}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? 'Salvando...'
                  : dialog.type === 'create'
                    ? 'Cadastrar produto'
                    : 'Salvar alterações'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {dialog?.type === 'delete' && (
        <Modal
          title="Excluir produto"
          description="Confirme a exclusão do produto selecionado."
          onClose={closeDialog}
        >
          <div className="confirmation-content">
            <div className="confirmation-icon danger">
              <Icon name="trash" size={22} />
            </div>
            <p>
              Excluir <strong>{dialog.product.name}</strong> (
              {dialog.product.code})?
            </p>
            <div className="warning-note">
              Produtos associados só podem ser excluídos após desassociar todas
              as etiquetas.
            </div>
            {saveError && (
              <p className="form-error" role="alert">
                {saveError}
              </p>
            )}
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={closeDialog} disabled={saving}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => void confirmDelete()}
              disabled={saving}
            >
              {saving ? 'Excluindo...' : 'Excluir produto'}
            </Button>
          </div>
        </Modal>
      )}
    </section>
  )
}
