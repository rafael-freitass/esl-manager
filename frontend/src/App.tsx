import { AppLayout } from './components/AppLayout'
import { LabelDialogs } from './components/LabelDialogs'
import { ToastMessage } from './components/ToastMessage'
import productsData from './data/products.json'
import { useLabelManagement } from './hooks/useLabelManagement'
import { AppRoutes } from './routes/AppRoutes'
import type { Product } from './types'

const products = productsData as Product[]

export default function App() {
  const labelManagement = useLabelManagement()

  return (
    <>
      <AppLayout>
        <AppRoutes products={products} labelManagement={labelManagement} />
      </AppLayout>

      {labelManagement.dialog && (
        <LabelDialogs
          key={
            labelManagement.dialog.type === 'create'
              ? labelManagement.dialog.type
              : `${labelManagement.dialog.type}-${labelManagement.dialog.label.id}`
          }
          dialog={labelManagement.dialog}
          products={products}
          onClose={labelManagement.closeDialog}
          onCreate={labelManagement.createLabel}
          onEdit={labelManagement.editLabel}
          onDelete={labelManagement.removeLabel}
          onAssociate={labelManagement.linkProduct}
          onRemoveAssociation={labelManagement.unlinkProduct}
        />
      )}

      <ToastMessage message={labelManagement.toast} />
    </>
  )
}
