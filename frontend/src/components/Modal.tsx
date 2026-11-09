import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icon.tsx'

type ModalProps = {
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
  width?: 'standard' | 'wide'
  busy?: boolean
  error?: string | null
}

export function Modal({
  title,
  description,
  children,
  onClose,
  width = 'standard',
  busy = false,
  error,
}: ModalProps) {
  const dialogRef = useRef<HTMLElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const initialFocus =
      dialog.querySelector<HTMLElement>('[autofocus]') ??
      dialog.querySelector<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])',
      ) ??
      dialog

    initialFocus.focus()

    return () => {
      if (previouslyFocused?.isConnected) previouslyFocused.focus()
    }
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      if (!busy) onClose()
      return
    }

    if (event.key !== 'Tab') return

    const dialog = dialogRef.current
    if (!dialog) return

    const focusableElements = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])',
      ),
    )
    const first = focusableElements[0]
    const last = focusableElements[focusableElements.length - 1]

    if (!first || !last) {
      event.preventDefault()
      dialog.focus()
    } else if (
      event.shiftKey &&
      (document.activeElement === first ||
        !dialog.contains(document.activeElement))
    ) {
      event.preventDefault()
      last.focus()
    } else if (
      !event.shiftKey &&
      (document.activeElement === last ||
        !dialog.contains(document.activeElement))
    ) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (!busy && event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        className={`modal ${width === 'wide' ? 'modal-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-busy={busy}
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p id={descriptionId}>{description}</p>}
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            disabled={busy}
            aria-label="Fechar"
          >
            <Icon name="x" />
          </button>
        </div>
        {error && (
          <p className="form-error modal-error" role="alert">
            {error}
          </p>
        )}
        {busy && (
          <p className="modal-progress" role="status">
            Salvando alteração...
          </p>
        )}
        <fieldset className="modal-fields" disabled={busy}>
          {children}
        </fieldset>
      </section>
    </div>
  )
}
