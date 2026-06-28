<script setup lang="ts">
import { AdminLayout, toastService } from '@admin'
import CreateButton from '@admin/components/ui/button/CreateButton.vue'
import DeleteButton from '@admin/components/ui/button/DeleteButton.vue'
import EditButton from '@admin/components/ui/button/EditButton.vue'
import DataTable from '@admin/components/ui/dataTable/DataTable.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { currencyService } from '../../services/currencyService'

const router = useRouter()
const table = ref()

const deleteCurrency = async (id: number) => {
  try {
    await currencyService.delete(id)
    toastService.success('Valuta sikeresen törölve!')
    table.value?.refresh()
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
</script>

<template>
  <AdminLayout pageTitle="Valuták">
    <DataTable
      ref="table"
      url="/api/admin/currency/currencies"
    >
      <template #actions>
        <CreateButton to="/admin/currency/create">
          Új valuta
        </CreateButton>
      </template>
      <template #cell-is_default="{ row }">
        <span v-if="(row as any).is_default" class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
          Alapértelmezett
        </span>
        <span v-else class="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
          -
        </span>
      </template>
      <template #cell-is_enabled="{ row }">
        <span v-if="(row as any).is_enabled" class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
          Engedélyezett
        </span>
        <span v-else class="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
          Letiltva
        </span>
      </template>
      <template #row-actions="{ row }">
        <EditButton
          @click="editCurrency((row as any).id)"
        />
        <DeleteButton
          @confirm="deleteCurrency((row as any).id)"
          :disabled="(row as any).is_default"
        />
      </template>
      <template #empty>
        Nincs megjeleníthető valuta.
      </template>
    </DataTable>
  </AdminLayout>
</template>
