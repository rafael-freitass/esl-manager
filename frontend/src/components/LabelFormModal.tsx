import type { SubmitEvent } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

type LabelFormModalProps = {
  title: string
  description: string
  value: string
  setValue: (value: string) => void
  onClose: () => void
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void
  submitLabel: string
}

export function LabelFormModal({
  title,
  description,
  value,
  setValue,
  onClose,
  onSubmit,
  submitLabel,
}: LabelFormModalProps) {
  return (
    <Modal title={title} description={description} onClose={onClose}>
      <form onSubmit={onSubmit}>
        <div className="modal-body">
          <label className="field-label" htmlFor="label-identifier">
            Identificador da etiqueta
          </label>
          <input
            id="label-identifier"
            className="text-input"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Ex.: ESL-009"
            autoFocus
            maxLength={24}
          />
          <span className="field-help">
            Use um identificador único para localizar a etiqueta.
          </span>
        </div>
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!value.trim()}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
