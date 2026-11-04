import type { ShelfLabel } from './index'

export type LabelDialogState =
  | { type: 'create' }
  | {
      type: 'edit' | 'delete' | 'associate' | 'remove'
      label: ShelfLabel
    }
