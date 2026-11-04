import { useState } from 'react'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import type { LabelStatus, Product, ShelfLabel } from '../types'

type LabelsPageProps = {
  labels: ShelfLabel[]
  products: Product[]
  onCreate: () => void
  onAction: (
    action: 'edit' | 'delete' | 'associate' | 'remove',
    label: ShelfLabel,
  ) => void
}

export function LabelsPage({
  labels,
  onCreate,
  onAction,
  products,
}: LabelsPageProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | LabelStatus>('all')
  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR')
  const visibleLabels = labels.filter(
    (label) =>
      label.identifier.toLocaleLowerCase('pt-BR').includes(normalizedSearch) &&
      (statusFilter === 'all' || label.status === statusFilter),
  )

  return (
    <section>
      <div className="table-toolbar">
        <div className="filters">
          <div className="search-field table-search">
            <Icon name="search" size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por identificador..."
              aria-label="Buscar etiquetas por identificador"
            />
          </div>
          <div className="select-wrap">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as 'all' | LabelStatus)
              }
              aria-label="Filtrar etiquetas por status"
            >
              <option value="all">Todos os status</option>
              <option value="available">Disponível</option>
              <option value="associated">Associada</option>
            </select>
            <Icon name="chevronDown" size={16} />
          </div>
        </div>
        <Button onClick={onCreate}>
          <Icon name="plus" size={17} />
          Nova etiqueta
        </Button>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <div>
            <h2>Etiquetas cadastradas</h2>
            <p>
              {visibleLabels.length}{' '}
              {visibleLabels.length === 1
                ? 'etiqueta encontrada'
                : 'etiquetas encontradas'}
            </p>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Identificador</th>
                <th>Produto associado</th>
                <th>Status</th>
                <th className="actions-heading">Ações</th>
              </tr>
            </thead>
            <tbody>
              {visibleLabels.map((label) => {
                const product = products.find(
                  (item) => item.code === label.productCode,
                )
                return (
                  <tr key={label.id}>
                    <td>
                      <div className="identifier-cell">
                        <span className="label-mini-icon">
                          <Icon name="tag" size={15} />
                        </span>
                        <strong>{label.identifier}</strong>
                      </div>
                    </td>
                    <td>
                      {product ? (
                        <div className="product-cell">
                          <strong>{product.name}</strong>
                          <span>{product.code}</span>
                        </div>
                      ) : (
                        <span className="not-associated">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${label.status}`}>
                        <span />
                        {label.status === 'associated'
                          ? 'Associada'
                          : 'Disponível'}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        {label.status === 'available' ? (
                          <button
                            className="text-action"
                            onClick={() => onAction('associate', label)}
                          >
                            <Icon name="link" size={15} />
                            Associar
                          </button>
                        ) : (
                          <button
                            className="text-action muted-action"
                            onClick={() => onAction('remove', label)}
                          >
                            <Icon name="unlink" size={15} />
                            Desassociar
                          </button>
                        )}
                        <button
                          className="icon-button"
                          onClick={() => onAction('edit', label)}
                          aria-label={`Editar ${label.identifier}`}
                          title="Editar"
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          className="icon-button danger-icon"
                          onClick={() => onAction('delete', label)}
                          aria-label={`Excluir ${label.identifier}`}
                          title="Excluir"
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {visibleLabels.length === 0 && (
          <EmptyState message="Nenhuma etiqueta encontrada." />
        )}
      </div>
    </section>
  )
}
