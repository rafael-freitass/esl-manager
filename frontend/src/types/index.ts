export type LabelStatus = 'available' | 'associated'

export interface Product {
  code: string
  name: string
  price: number
}

export interface ShelfLabel {
  id: number
  identifier: string
  status: LabelStatus
  productCode?: string
}
