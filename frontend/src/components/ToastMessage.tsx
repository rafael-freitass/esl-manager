import { Icon } from './Icon'

export function ToastMessage({ message }: { message: string | null }) {
  if (!message) return null

  return (
    <div className="toast" role="status">
      <span>
        <Icon name="check" size={15} />
      </span>
      {message}
    </div>
  )
}
