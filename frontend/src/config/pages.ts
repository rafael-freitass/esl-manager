import type { IconName } from '../components/Icon.tsx'

type PageConfig = {
  path: string
  title: string
  description: string
  icon: IconName
}

export const pages = {
  home: {
    path: '/',
    title: 'Início',
    description: 'Visão geral das etiquetas da sua loja.',
    icon: 'home',
  },
  labels: {
    path: '/etiquetas',
    title: 'Etiquetas',
    description: 'Gerencie etiquetas e associações de produtos.',
    icon: 'tag',
  },
  products: {
    path: '/produtos',
    title: 'Produtos',
    description: 'Consulte o catálogo de produtos disponível.',
    icon: 'package',
  },
} satisfies Record<string, PageConfig>
