import type { RouteRecordRaw } from 'vue-router'

const currencyRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/currency',
    name: 'admin-currencies',
    component: () => import('../views/currency/CurrencyIndex.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/currency/create',
    name: 'admin-currency-create',
    component: () => import('../views/currency/CurrencyCreate.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/currency/:id/edit',
    name: 'admin-currency-edit',
    component: () => import('../views/currency/CurrencyEdit.vue'),
    meta: { requiresAuth: true }
  },
]

export default currencyRoutes

