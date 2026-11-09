import { useState } from 'react'
import { Button } from '../components/Button.tsx'
import { EmptyState } from '../components/EmptyState.tsx'
import { Icon } from '../components/Icon.tsx'
import type { LabelStatus, Product, ShelfLabel } from '../types/index.ts'

const syncText = {
  pending: 'Pendente',
  sending: 'Enviando',
  updated: 'Atualizada',
  error: 'Falha na atualização',
}
const errorText: Record<string, string> = {
  TIMEOUT: 'O dispositivo não confirmou dentro do prazo.',
  FALHA_COMUNICACAO: 'Não foi possível comunicar com o dispositivo.',
  RESPOSTA_HTTP_INVALIDA: 'O dispositivo retornou um erro HTTP.',
  ACK_INVALIDO: 'O dispositivo não retornou uma confirmação válida.',
  ENVIO_NAO_AGENDADO: 'Não foi possível agendar o envio.',
  ENVIO_INTERROMPIDO: 'O envio foi interrompido.',
  FALHA_INTERNA: 'Ocorreu uma falha ao enviar o conteúdo.',
}

type LabelsPageProps = {
  labels: ShelfLabel[]
  products: Product[]
  onCreate: () => void
  loading: boolean
  onRefresh: () => Promise<void>
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
  loading,
  onRefresh,
}: LabelsPageProps) {
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | LabelStatus>('all')
  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR')
  const visibleLabels = labels.filter((label) => {
    const matchesSearch =
      label.name.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
      label.identifier.toLocaleLowerCase('pt-BR').includes(normalizedSearch)
    return (
      matchesSearch && (statusFilter === 'all' || label.status === statusFilter)
    )
  })

  const refresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <section>
      <div className="table-toolbar">
        <div className="filters">
          <div className="search-field table-search">
            <Icon name="search" size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou código..."
              aria-label="Buscar etiquetas por nome ou código"
            />
          </div>
          <div className="select-wrap">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as 'all' | LabelStatus)
              }
              aria-label="Filtrar etiquetas por associação"
            >
              <option value="all">Todas as associações</option>
              <option value="available">Disponível</option>
              <option value="associated">Associada</option>
            </select>
            <Icon name="chevronDown" size={16} />
          </div>
        </div>
        <div className="actions">
          <Button
            variant="secondary"
            onClick={() => void refresh()}
            disabled={loading || refreshing}
          >
            {refreshing ? 'Atualizando...' : 'Atualizar lista'}
          </Button>
          <Button onClick={onCreate}>
            <Icon name="plus" size={17} />
            Nova etiqueta
          </Button>
        </div>
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
                <th>Nome da etiqueta</th>
                <th>Código</th>
                <th>Produto associado</th>
                <th>Associação</th>
                <th title="Confirmação do conteúdo atual; não indica conectividade.">
                  Sincronização
                </th>
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
                        <strong>{label.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="product-code">{label.identifier}</span>
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
                      <span
                        className={`badge sync-${label.syncStatus}`}
                        title={
                          label.syncStatus === 'updated'
                            ? 'Conteúdo atual confirmado pelo dispositivo.'
                            : label.syncStatus === 'error'
                              ? 'A tentativa terminou sem confirmação válida.'
                              : label.syncStatus === 'sending'
                                ? 'Tentativa de envio em andamento.'
                                : 'Aguardando confirmação do conteúdo atual.'
                        }
                      >
                        <span />
                        {syncText[label.syncStatus]}
                      </span>
                      {label.awaitingRegistration && (
                        <small className="sync-detail">
                          Aguardando registro do dispositivo.
                        </small>
                      )}
                      {label.syncStatus === 'error' && (
                        <small className="sync-detail" role="status">
                          {errorText[label.syncError ?? ''] ??
                            'A atualização não foi confirmada.'}{' '}
                          Registre novamente o dispositivo para tentar outra
                          vez.
                        </small>
                      )}
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
                          aria-label={`Editar ${label.name}`}
                          title="Editar"
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          className="icon-button danger-icon"
                          onClick={() => onAction('delete', label)}
                          aria-label={`Excluir ${label.name}`}
                          title={label.deletionBlockReason ?? 'Excluir'}
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
