import type { SubmitEvent } from 'react'
import { Button } from './Button.tsx'
import { Modal } from './Modal.tsx'

type LabelFormModalProps = {
  title: string
  description: string
  name: string
  setName: (name: string) => void
  identifier: string
  identifierBlockReason?: string | null
  setIdentifier: (identifier: string) => void
  busy: boolean
  error: string | null
  onClose: () => void
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void
  submitLabel: string
}

export function LabelFormModal({
  title,
  description,
  name,
  setName,
  identifier,
  identifierBlockReason,
  setIdentifier,
  onClose,
  busy,
  error,
  onSubmit,
  submitLabel,
}: LabelFormModalProps) {
  return (
    <Modal
      title={title}
      description={description}
      onClose={onClose}
      busy={busy}
      error={error}
    >
      <form onSubmit={onSubmit}>
        <div className="modal-body">
          <label className="field-label" htmlFor="label-name">
            Nome da etiqueta
          </label>
          <input
            id="label-name"
            className="text-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex.: Gôndola A · posição 3"
            autoFocus
            maxLength={24}
          />
          <span className="field-help">
            Nome amigável para reconhecer a etiqueta na loja.
          </span>
          <label className="field-label" htmlFor="label-identifier">
            Código do dispositivo
          </label>
          <input
            id="label-identifier"
            disabled={Boolean(identifierBlockReason)}
            className="text-input"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="Ex.: ESL-009"
            maxLength={64}
          />
          <span className="field-help">
            {identifierBlockReason ??
              'Código único usado pelo sistema para identificar a etiqueta.'}
          </span>
        </div>
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!name.trim() || !identifier.trim()}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
