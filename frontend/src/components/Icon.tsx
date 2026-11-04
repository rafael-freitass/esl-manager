import {
  ArrowRight,
  Check,
  ChevronDown,
  Home,
  Link,
  Package,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  Unlink,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type IconName =
  | 'home'
  | 'tag'
  | 'package'
  | 'plus'
  | 'search'
  | 'chevronDown'
  | 'edit'
  | 'trash'
  | 'link'
  | 'unlink'
  | 'x'
  | 'arrowRight'
  | 'check'

const icons: Record<IconName, LucideIcon> = {
  home: Home,
  tag: Tag,
  package: Package,
  plus: Plus,
  search: Search,
  chevronDown: ChevronDown,
  edit: Pencil,
  trash: Trash2,
  link: Link,
  unlink: Unlink,
  x: X,
  arrowRight: ArrowRight,
  check: Check,
}

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const IconComponent = icons[name]
  return <IconComponent size={size} aria-hidden="true" />
}
