import type { ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  type?: 'button' | 'submit'
  onClick?: () => void
  disabled?: boolean
}

export function Button({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  disabled,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`button button-${variant}`}
    >
      {children}
    </button>
  )
}
