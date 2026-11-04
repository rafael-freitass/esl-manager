import { Navigate, Route, Routes } from 'react-router'
import { HomePage } from '../Pages/HomePage'
import { LabelsPage } from '../Pages/LabelsPage'
import { ProductsPage } from '../Pages/ProductsPage'
import { pages } from '../config/pages'
import type { useLabelManagement } from '../hooks/useLabelManagement'
import type { Product } from '../types'

type AppRoutesProps = {
  products: Product[]
  labelManagement: ReturnType<typeof useLabelManagement>
}

export function AppRoutes({ products, labelManagement }: AppRoutesProps) {
  return (
    <Routes>
      <Route
        path={pages.home.path}
        element={<HomePage counts={labelManagement.counts} />}
      />
      <Route
        path={pages.labels.path}
        element={
          <LabelsPage
            labels={labelManagement.labels}
            products={products}
            onCreate={labelManagement.openCreateDialog}
            onAction={labelManagement.openLabelDialog}
          />
        }
      />
      <Route
        path={pages.products.path}
        element={<ProductsPage products={products} />}
      />
      <Route path="*" element={<Navigate to={pages.home.path} replace />} />
    </Routes>
  )
}
