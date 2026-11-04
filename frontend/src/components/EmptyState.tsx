import { Icon } from './Icon'

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon name="search" size={20} />
      </div>
      <p>{message}</p>
      <span>Tente ajustar os termos da busca ou os filtros.</span>
    </div>
  )
}
