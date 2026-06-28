import { createApiClient } from '@user'

const api = createApiClient()

export interface Currency {
  id?: number
  code: string
  name: string
  symbol: string
  decimals?: number
  decimal_separator?: string
  thousands_separator?: string
  is_symbol_first?: boolean
  is_enabled?: boolean
  is_default?: boolean
  created_at?: string
  updated_at?: string
}

export interface CurrencyFormData {
  code: string
  name: string
  symbol: string
  decimals?: number
  decimal_separator?: string
  thousands_separator?: string
  is_symbol_first?: boolean
  is_enabled?: boolean
  is_default?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  filters?: {
    search?: string
    sort?: string
    direction?: string
  }
  columns?: Array<{ key: string; label: string; sortable: boolean }>
}

export interface SingleResponse<T> {
  data: T
}

export const currencyService = {
  getAll(params?: { search?: string; sort?: string; direction?: string; page?: number }) {
    return api.get<PaginatedResponse<Currency>>('/api/admin/currency/currencies', { params })
  },
  searchForSelect(params?: { search?: string; page?: number; per_page?: number; include_disabled?: boolean }) {
    return api.get<PaginatedResponse<Currency>>('/api/admin/currency/currencies/select', { params })
  },
  getById(id: number | string) {
    return api.get<SingleResponse<Currency>>(`/api/admin/currency/currencies/${id}`)
  },
  getCreateData() {
    return api.get('/api/admin/currency/currencies/create')
  },
  getEditData(id: number | string) {
    return api.get<{ data: Currency }>(`/api/admin/currency/currencies/${id}/edit`)
  },
  create(currency: CurrencyFormData) {
    return api.post<Currency>('/api/admin/currency/currencies', currency)
  },
  update(id: number | string, currency: CurrencyFormData) {
    return api.put<Currency>(`/api/admin/currency/currencies/${id}`, currency)
  },
  delete(id: number | string) {
    return api.delete(`/api/admin/currency/currencies/${id}`)
  },
}

