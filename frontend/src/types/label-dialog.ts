import type { ShelfLabel } from './index.ts'

export type LabelDialogState =
  | { type: 'create' }
  | {
      type: 'edit' | 'delete' | 'associate' | 'remove'
      label: ShelfLabel
    }
