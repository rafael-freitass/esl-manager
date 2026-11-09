import { Navigate, Route, Routes } from 'react-router'
import { HomePage } from '../pages/HomePage.tsx'
import { LabelsPage } from '../pages/LabelsPage.tsx'
import { ProductsPage } from '../pages/ProductsPage.tsx'
import { pages } from '../config/pages.ts'
import type { useLabelManagement } from '../hooks/useLabelManagement.ts'
import type { Product } from '../types/index.ts'

type AppRoutesProps = {
  onRefresh: () => Promise<void>
  refreshing: boolean
  products: Product[]
  onUpdateProduct: (
    productCode: string,
    name: string,
    price: number,
  ) => Promise<void>
  onCreateProduct: (
    productCode: string,
    name: string,
    price: number,
  ) => Promise<void>
  onDeleteProduct: (productCode: string) => Promise<void>
  labelManagement: ReturnType<typeof useLabelManagement>
}

export function AppRoutes({
  products,
  onUpdateProduct,
  onCreateProduct,
  onDeleteProduct,
  labelManagement,
  onRefresh,
  refreshing,
}: AppRoutesProps) {
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
            loading={labelManagement.loading || refreshing}
            onRefresh={onRefresh}
          />
        }
      />
      <Route
        path={pages.products.path}
        element={
          <ProductsPage
            onRefresh={onRefresh}
            refreshing={refreshing}
            products={products}
            onUpdateProduct={onUpdateProduct}
            onCreateProduct={onCreateProduct}
            onDeleteProduct={onDeleteProduct}
          />
        }
      />
      <Route path="*" element={<Navigate to={pages.home.path} replace />} />
    </Routes>
  )
}
