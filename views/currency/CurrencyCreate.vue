<script setup lang="ts">
import { AdminLayout, BackButton, toastService, InputError } from '@admin'
import Label from '@admin/components/ui/Label.vue'
import Input from '@admin/components/ui/Input.vue'
import Card from '@admin/components/ui/Card.vue'
import CardContent from '@admin/components/ui/CardContent.vue'
import CardDescription from '@admin/components/ui/CardDescription.vue'
import CardFooter from '@admin/components/ui/CardFooter.vue'
import CardHeader from '@admin/components/ui/CardHeader.vue'
import CardTitle from '@admin/components/ui/CardTitle.vue'
import Checkbox from '@admin/components/ui/Checkbox.vue'
import { FormButtons } from '@admin'
import { useRouter } from 'vue-router'
import { reactive, ref } from 'vue'
import { currencyService, type CurrencyFormData } from '../../services/currencyService'

const router = useRouter()
const isSaving = ref(false)
const errors = ref<Record<string, string[]>>({})

const form = reactive<CurrencyFormData>({
  code: '',
  name: '',
  symbol: '',
  decimals: 2,
  decimal_separator: '.',
  thousands_separator: ',',
  is_symbol_first: true,
  is_enabled: true,
  is_default: false
})

const handleSubmit = async () => {
  try {
    isSaving.value = true
    errors.value = {}
    await currencyService.create(form)
    toastService.success('Valuta sikeresen létrehozva!')
    router.push('/admin/currency')
  } catch (error: any) {
    console.error('Hiba a valuta létrehozásakor:', error)
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors
      toastService.error('Kérjük, javítsd a hibaüzeneteket.')
    } else {
      toastService.error('Hiba történt a mentés során.')
    }
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <AdminLayout pageTitle="Új valuta">
    <div class="flex items-center justify-between space-y-2 mb-4">
      <BackButton to="/admin/currency" />
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Valuta adatok</CardTitle>
        <CardDescription>Add meg az új valuta adatait a létrehozáshoz.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="code">Kód *</Label>
            <Input id="code" v-model="form.code" placeholder="USD" maxlength="3" />
            <InputError :message="errors.code" />
          </div>
          <div class="space-y-2">
            <Label for="name">Név *</Label>
            <Input id="name" v-model="form.name" placeholder="US Dollar" />
            <InputError :message="errors.name" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="symbol">Szimbólum *</Label>
            <Input id="symbol" v-model="form.symbol" placeholder="$" />
            <InputError :message="errors.symbol" />
          </div>
          <div class="space-y-2">
            <Label for="decimals">Tizedesjegyek</Label>
            <Input id="decimals" v-model.number="form.decimals" type="number" min="0" max="8" />
            <InputError :message="errors.decimals" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="decimal_separator">Tizedeselválasztó</Label>
            <Input id="decimal_separator" v-model="form.decimal_separator" placeholder="." maxlength="1" />
            <InputError :message="errors.decimal_separator" />
          </div>
          <div class="space-y-2">
            <Label for="thousands_separator">Ezreselválasztó</Label>
            <Input id="thousands_separator" v-model="form.thousands_separator" placeholder="," maxlength="1" />
            <InputError :message="errors.thousands_separator" />
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <Checkbox id="is_symbol_first" v-model:checked="form.is_symbol_first" />
            <Label for="is_symbol_first" class="cursor-pointer">Szimbólum az összeg előtt</Label>
          </div>
          <div class="flex items-center space-x-2">
            <Checkbox id="is_enabled" v-model:checked="form.is_enabled" />
            <Label for="is_enabled" class="cursor-pointer">Engedélyezett</Label>
          </div>
          <div class="flex items-center space-x-2">
            <Checkbox id="is_default" v-model:checked="form.is_default" />
            <Label for="is_default" class="cursor-pointer">Alapértelmezett valuta</Label>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <FormButtons
          :is-saving="isSaving"
          @save="handleSubmit"
          @cancel="router.push('/admin/currency')"
        />
      </CardFooter>
    </Card>
  </AdminLayout>
</template>

