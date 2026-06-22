<script setup lang="ts">
import { AdminLayout, toastService } from '@admin'
import CreateButton from '@admin/components/ui/button/CreateButton.vue'
import DeleteButton from '@admin/components/ui/button/DeleteButton.vue'
import EditButton from '@admin/components/ui/button/EditButton.vue'
import DataTable, { type Column, type PaginationMeta } from '@admin/components/ui/dataTable/DataTable.vue'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { currencyService, type Currency } from '../../services/currencyService'

const router = useRouter()
const currencies = ref<Currency[]>([])
const isLoading = ref(false)
const pagination = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0
})

const columns: Column<Currency>[] = [
  { key: 'code', label: 'Kód', sortable: true, width: '100px' },
  { key: 'name', label: 'Név', sortable: true },
  { key: 'symbol', label: 'Szimbólum', sortable: false, width: '100px' },
  { key: 'is_default', label: 'Alapértelmezett', sortable: false, width: '150px' },
  { key: 'is_enabled', label: 'Engedélyezett', sortable: false, width: '150px' },
]

const fetchCurrencies = async (params: {
  search?: string
  sort?: string
  direction?: 'asc' | 'desc'
  page?: number
}) => {
  try {
    isLoading.value = true
    const response = await currencyService.getAll(params)
    currencies.value = response.data.data
    pagination.value = response.data.meta
  } catch (error) {
    console.error('Hiba a valuták betöltésekor:', error)
  } finally {
    isLoading.value = false
  }
}

const deleteCurrency = async (id: number) => {
  try {
    await currencyService.delete(id)
    toastService.success('Valuta sikeresen törölve!')
    await fetchCurrencies({ page: pagination.value.current_page })
  } catch (error: any) {
    console.error('Hiba a valuta törlésekor:', error)
    if (error.response?.data?.message) {
      toastService.error(error.response.data.message)
    } else {
      toastService.error('Hiba történt a törlés során.')
    }
  }
}

const editCurrency = (id: number) => {
  router.push(`/admin/currency/${id}/edit`)
}

onMounted(() => {
  fetchCurrencies({
    page: 1,
    sort: 'code',
    direction: 'asc'
  })
})
</script>

<template>
  <AdminLayout pageTitle="Valuták">
    <DataTable
      :columns="columns"
      :data="currencies"
      :loading="isLoading"
      :pagination="pagination"
      :searchable="true"
      search-placeholder="Keresés kód vagy név alapján..."
      default-sort="code"
      default-direction="asc"
      @fetch="fetchCurrencies"
    >
      <template #actions>
        <CreateButton to="/admin/currency/create">
          Új valuta
        </CreateButton>
      </template>
      <template #cell-is_default="{ row }">
        <span v-if="row.is_default" class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
          Alapértelmezett
        </span>
        <span v-else class="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
          -
        </span>
      </template>
      <template #cell-is_enabled="{ row }">
        <span v-if="row.is_enabled" class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
          Engedélyezett
        </span>
        <span v-else class="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
          Letiltva
        </span>
      </template>
      <template #row-actions="{ row }">
        <EditButton
          @click="editCurrency(row.id!)"
        />
        <DeleteButton
          @confirm="deleteCurrency(row.id!)"
          :disabled="row.is_default"
        />
      </template>
      <template #empty>
        Nincs megjeleníthető valuta.
      </template>
    </DataTable>
  </AdminLayout>
</template>

