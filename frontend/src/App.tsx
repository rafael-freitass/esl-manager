import { AppLayout } from './components/AppLayout.tsx'
import { LabelDialogs } from './components/LabelDialogs.tsx'
import { ToastMessage } from './components/ToastMessage.tsx'
import { useLabelManagement } from './hooks/useLabelManagement.ts'
import { useProducts } from './hooks/useProducts.ts'
import { AppRoutes } from './routes/AppRoutes.tsx'

export default function App() {
  const labelManagement = useLabelManagement()
  const productData = useProducts()
  const errors = [labelManagement.error, productData.error].filter(Boolean)

  const refreshAll = async () => {
    await Promise.all([
      labelManagement.refreshLabels(),
      productData.refreshProducts(),
    ])
  }
  const updateProduct = async (code: string, name: string, price: number) => {
    labelManagement.beginProductUpdate(code)
    let saved = false
    try {
      await productData.updateDetails(code, name, price)
      saved = true
    } finally {
      await labelManagement.endProductUpdate(code, saved)
    }
  }

  return (
    <>
      <AppLayout>
        {errors.map((error) => (
          <p key={error} role="alert" className="api-error">
            {error}
          </p>
        ))}
        {(labelManagement.loading || productData.loading) && (
          <p role="status" className="api-loading">
            Carregando dados do sistema...
          </p>
        )}
        <AppRoutes
          products={productData.products}
          onUpdateProduct={updateProduct}
          onCreateProduct={productData.addProduct}
          onDeleteProduct={productData.removeProduct}
          labelManagement={labelManagement}
          onRefresh={refreshAll}
          refreshing={labelManagement.refreshing || productData.refreshing}
        />
      </AppLayout>

      {labelManagement.dialog && (
        <LabelDialogs
          key={
            labelManagement.dialog.type === 'create'
              ? labelManagement.dialog.type
              : `${labelManagement.dialog.type}-${labelManagement.dialog.label.id}`
          }
          dialog={labelManagement.dialog}
          products={productData.products}
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
