<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import Checkbox from '@admin/components/ui/Checkbox.vue'
import Modal from '@admin/components/ui/Modal.vue'
import Icon from '@admin/components/ui/Icon.vue'
import { currencyService, type Currency } from '../services/currencyService'

interface Props {
  id?: string
  modelValue?: number | null
  options?: Currency[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  emptyValue?: number | null
  autoSelectDefaultWhenEmpty?: boolean
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  modelValue: null,
  options: () => [],
  placeholder: 'Valassz penznemet',
  searchPlaceholder: 'Kereses kod, nev vagy szimbolum alapjan...',
  emptyMessage: 'Nincs talalat.',
  emptyValue: null,
  autoSelectDefaultWhenEmpty: true,
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
}>()

interface CurrencyDisplayItem {
  id: number
  code: string
  name: string
  symbol: string
  isEnabled: boolean
  searchText: string
}

const isModalOpen = ref(false)
const isLoading = ref(false)
const search = ref('')
const includeDisabled = ref(false)
const currencies = ref<Currency[]>([...props.options])
const selectedCurrencyData = ref<Currency | null>(null)
const modalPerPage = 500
let searchTimeout: ReturnType<typeof setTimeout> | null = null
let currenciesRequestId = 0
let selectedCurrencyRequestId = 0
let defaultCurrencyRequestId = 0

const clearSearchTimeout = (): void => {
  if (searchTimeout !== null) {
    clearTimeout(searchTimeout)
    searchTimeout = null
  }
}

const normalizeCurrency = (currency: Currency | null): CurrencyDisplayItem | null => {
  if (currency === null || currency.id === undefined) {
    return null
  }

  const code = String(currency.code ?? '').trim()
  const name = String(currency.name ?? '').trim()
  const symbol = String(currency.symbol ?? '').trim()

  return {
    id: currency.id,
    code: code.length > 0 ? code : '-',
    name: name.length > 0 ? name : `#${currency.id}`,
    symbol: symbol.length > 0 ? symbol : '-',
    isEnabled: currency.is_enabled ?? false,
    searchText: `${code} ${name} ${symbol}`.toLowerCase(),
  }
}

const isEmptySelection = (value: number | null | undefined): boolean => {
  return value === null || value === props.emptyValue
}

const getDefaultCurrency = (items: Currency[]): Currency | null => {
  return items.find((currency) => currency.id !== undefined && currency.is_default === true) ?? null
}

const setDefaultCurrencyIfNeeded = (currency: Currency | null): boolean => {
  if (
    currency === null ||
    currency.id === undefined ||
    !props.autoSelectDefaultWhenEmpty ||
    !isEmptySelection(props.modelValue)
  ) {
    return false
  }

  selectedCurrencyData.value = currency
  emit('update:modelValue', currency.id)

  return true
}

const ensureDefaultCurrencySelected = async (): Promise<void> => {
  if (!props.autoSelectDefaultWhenEmpty || !isEmptySelection(props.modelValue)) {
    return
  }

  const localDefaultCurrency = getDefaultCurrency(currencies.value)

  if (setDefaultCurrencyIfNeeded(localDefaultCurrency)) {
    return
  }

  const requestId = ++defaultCurrencyRequestId

  try {
    const params: Record<string, string | number | boolean | undefined> = {
      per_page: modalPerPage,
      include_disabled: true,
    }

    const response = await currencyService.searchForSelect(params)

    if (requestId !== defaultCurrencyRequestId) {
      return
    }

    const defaultCurrency = getDefaultCurrency(response.data.data ?? [])

    if (defaultCurrency === null) {
      return
    }

    if (!currencies.value.some((currency) => currency.id === defaultCurrency.id)) {
      currencies.value = [...currencies.value, defaultCurrency]
    }

    setDefaultCurrencyIfNeeded(defaultCurrency)
  } catch {
  }
}

const normalizedCurrencies = computed(() => {
  return currencies.value
    .map((currency) => normalizeCurrency(currency))
    .filter((currency): currency is CurrencyDisplayItem => currency !== null)
})

const selectedCurrency = computed(() => {
  if (props.modelValue === null || props.modelValue === props.emptyValue) {
    return null
  }

  return normalizeCurrency(
    selectedCurrencyData.value ??
      currencies.value.find((currency) => currency.id === props.modelValue) ??
      null,
  )
})

const setCurrencies = (items: Currency[]): void => {
  currencies.value = items.map((currency) => ({ ...currency }))
}

const fetchCurrencies = async (query: string): Promise<void> => {
  const requestId = ++currenciesRequestId
  isLoading.value = true

  try {
    const params: Record<string, string | number | boolean | undefined> = {
      search: query.trim().length > 0 ? query.trim() : undefined,
      per_page: modalPerPage,
      include_disabled: includeDisabled.value,
    }

    const response = await currencyService.searchForSelect(params)

    if (requestId !== currenciesRequestId) {
      return
    }

    setCurrencies(response.data.data ?? [])
  } finally {
    if (requestId === currenciesRequestId) {
      isLoading.value = false
    }
  }
}

const fetchSelectedCurrency = async (currencyId: number): Promise<void> => {
  const requestId = ++selectedCurrencyRequestId
  const existingCurrency = currencies.value.find((currency) => currency.id === currencyId)

  if (existingCurrency) {
    selectedCurrencyData.value = existingCurrency
    return
  }

  try {
    const response = await currencyService.getById(currencyId)

    if (requestId !== selectedCurrencyRequestId) {
      return
    }

    selectedCurrencyData.value = response.data.data
  } catch {
    if (requestId === selectedCurrencyRequestId) {
      selectedCurrencyData.value = null
    }
  }
}

watch(
  () => props.options,
  (value) => {
    if (value.length > 0) {
      setCurrencies(value)
    }

    void ensureDefaultCurrencySelected()
  },
  { deep: true, immediate: true },
)

watch(
  () => props.modelValue,
  (value) => {
    if (value === null || value === props.emptyValue) {
      selectedCurrencyData.value = null
      void ensureDefaultCurrencySelected()
      return
    }

    void fetchSelectedCurrency(value)
  },
  { immediate: true },
)

watch(search, () => {
  if (!isModalOpen.value) {
    return
  }

  clearSearchTimeout()

  searchTimeout = setTimeout(() => {
    void fetchCurrencies(search.value)
  }, 300)
})

watch(includeDisabled, () => {
  if (!isModalOpen.value) {
    return
  }

  clearSearchTimeout()
  void fetchCurrencies(search.value)
})

onBeforeUnmount(() => {
  clearSearchTimeout()
})

const selectCurrency = (currencyId: number): void => {
  emit('update:modelValue', currencyId)
  selectedCurrencyData.value = currencies.value.find((currency) => currency.id === currencyId) ?? selectedCurrencyData.value
  isModalOpen.value = false
  search.value = ''
}

const openModal = (): void => {
  if (props.disabled) {
    return
  }

  isModalOpen.value = true
  clearSearchTimeout()
  void fetchCurrencies(search.value)
}

const closeModal = (): void => {
  isModalOpen.value = false
  search.value = ''
  includeDisabled.value = false
  clearSearchTimeout()
}

const clearSelection = (): void => {
  emit('update:modelValue', props.emptyValue)
  selectedCurrencyData.value = null
}
</script>

<template>
  <div>
    <button
      type="button"
      :id="id"
      :disabled="disabled"
      class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      @click="openModal"
    >
      <span v-if="selectedCurrency" class="truncate">
        {{ selectedCurrency.code }} - {{ selectedCurrency.name }} ({{ selectedCurrency.symbol }})
      </span>
      <span v-else class="truncate text-muted-foreground">{{ placeholder }}</span>
      <span class="ml-2 shrink-0 text-xs text-muted-foreground">Kivalasztas</span>
    </button>

    <input
      v-if="required"
      type="text"
      tabindex="-1"
      aria-hidden="true"
      class="pointer-events-none absolute h-0 w-0 opacity-0"
      :value="modelValue ?? ''"
      required
    />

    <Modal :show="isModalOpen" title="Penznem kivalasztasa" @close="closeModal">
      <div class="space-y-3">
        <input
          v-model="search"
          type="text"
          autofocus
          class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          :placeholder="searchPlaceholder"
        />

        <div class="flex items-center gap-2">
          <Checkbox id="currency_select_include_disabled" v-model="includeDisabled" />
          <label for="currency_select_include_disabled" class="cursor-pointer text-sm text-foreground">
            Minden pénznem mutatása
          </label>
        </div>

        <div class="max-h-96 overflow-y-auto rounded-md border p-1">
          <div v-if="isLoading" class="px-3 py-2 text-sm text-muted-foreground">
            Betoltes...
          </div>

          <div v-else-if="normalizedCurrencies.length === 0" class="px-3 py-2 text-sm text-muted-foreground">
            {{ emptyMessage }}
          </div>

          <button
            v-for="currency in normalizedCurrencies"
            :key="currency.id"
            type="button"
            class="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            :class="{ 'bg-accent text-accent-foreground': modelValue === currency.id }"
            @click="selectCurrency(currency.id)"
          >
             <span class="min-w-0 flex-1">
               <span class="block truncate font-medium">{{ currency.code }} - {{ currency.name }}</span>
               <span class="block truncate text-xs text-muted-foreground">
                 {{ currency.symbol }}
                 <span v-if="!currency.isEnabled">- Letiltva</span>
               </span>
             </span>

             <Icon v-if="modelValue === currency.id" name="check" class="h-4 w-4 shrink-0" />
          </button>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="inline-flex items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
          @click="closeModal"
        >
          Megse
        </button>
        <button
          type="button"
          class="inline-flex items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
          @click="clearSelection"
        >
          Kivalasztas torlese
        </button>
      </template>
    </Modal>
  </div>
</template>


