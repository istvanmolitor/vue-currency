import type { MenuItem } from '@admin'

export const currencyMenuConfig: MenuItem[] = [
  {
    label: 'Valuták',
    icon: 'dollar-sign',
    to: '/admin/currency',
    permission: 'currency.view'
  }
]

export default currencyMenuConfig

