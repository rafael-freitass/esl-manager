import { useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import type { Product } from '../types'
import { formatPrice } from '../utils/formatPrice'

type ProductsPageProps = {
  products: Product[]
}

export function ProductsPage({ products }: ProductsPageProps) {
  const [search, setSearch] = useState('')
  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR')
  const visibleProducts = products.filter(
    (product) =>
      product.name.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
      product.code.toLocaleLowerCase('pt-BR').includes(normalizedSearch),
  )

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
        <span className="catalog-note">Catálogo somente para consulta</span>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visibleProducts.length === 0 && (
          <EmptyState message="Nenhum produto encontrado." />
        )}
      </div>
    </section>
  )
}
