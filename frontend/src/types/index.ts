export type LabelStatus = 'available' | 'associated'
export type LabelSyncStatus = 'pending' | 'sending' | 'updated' | 'error'

export interface Product {
  code: string
  name: string
  price: number
}

export interface ShelfLabel {
  id: number
  name: string
  identifier: string
  status: LabelStatus
  syncStatus: LabelSyncStatus
  syncError: string | null
  awaitingRegistration: boolean
  canDelete: boolean
  deletionBlockReason: string | null
  productCode?: string
}
