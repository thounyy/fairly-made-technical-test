<script setup lang="ts">
type Origin = 'declaration' | 'correction'

type CompositionLine = {
  id: string
  rawMaterial: string
  percentage: number
  originCountryCode: string | null
}

type Step = {
  id: string
  process: string
  supplierId: string | null
  supplierName: string | null
  supplierOrigin: Origin
  countryCode: string | null
  countryOrigin: Origin
  origin: Origin
}

type TreeItem = {
  id: string
  kind: 'PRODUCT' | 'COMPONENT' | 'MATERIAL'
  label: string
  steps: Step[]
  children: TreeItem[]
  usageCategory?: string
  usagePercentage?: number
  composition?: { lines: CompositionLine[]; origin: Origin }
  rawMaterial?: string
  originCountryCode?: string | null
}

type Supplier = { id: string; name: string }
type ProcessOption = { code: string; label: string }

const props = defineProps<{
  item: TreeItem
  suppliers: Supplier[]
  processes: ProcessOption[]
}>()

const emit = defineEmits<{
  'set-supplier': [stepId: string, supplierId: string | null]
  'set-country': [stepId: string, countryCode: string | null]
  'add-step': [
    itemId: string,
    draft: {
      process: string
      supplierId: string | null
      countryCode: string | null
    },
  ]
  'set-composition': [
    componentId: string,
    lines: { id: string; percentage: number }[],
  ]
}>()

defineOptions({ name: 'TreeItem' })

const percentages = ref<Record<string, string>>({})
const newProcess = ref(props.processes[0]?.code ?? '')
const newSupplierId = ref('')
const newCountry = ref('')

watch(
  () => props.item,
  (item) => {
    if (item.kind !== 'COMPONENT' || !item.composition) {
      return
    }
    const next: Record<string, string> = {}
    for (const line of item.composition.lines) {
      next[line.id] = String(line.percentage)
    }
    percentages.value = next
  },
  { immediate: true },
)

function processLabel(code: string): string {
  return props.processes.find((process) => process.code === code)?.label ?? code
}

function onSupplier(stepId: string, value: string) {
  emit('set-supplier', stepId, value === '' ? null : value)
}

function onCountry(stepId: string, value: string) {
  emit('set-country', stepId, value.trim() === '' ? null : value.trim().toUpperCase())
}

function saveComposition() {
  if (!props.item.composition) {
    return
  }
  emit(
    'set-composition',
    props.item.id,
    props.item.composition.lines.map((line) => ({
      id: line.id,
      percentage: Number(percentages.value[line.id]),
    })),
  )
}

function saveStep() {
  emit('add-step', props.item.id, {
    process: newProcess.value,
    supplierId: newSupplierId.value === '' ? null : newSupplierId.value,
    countryCode: newCountry.value.trim() === '' ? null : newCountry.value.trim().toUpperCase(),
  })
  newCountry.value = ''
  newSupplierId.value = ''
}
</script>

<template>
  <article>
    <header>
      <p class="kind">{{ item.kind }}</p>
      <h2>{{ item.label }}</h2>
      <p v-if="item.kind === 'COMPONENT'">
        {{ item.usageCategory }} · {{ item.usagePercentage }}% of the product
      </p>
      <p v-if="item.kind === 'MATERIAL'">
        {{ item.rawMaterial }}
        <template v-if="item.originCountryCode"> · {{ item.originCountryCode }}</template>
        <template v-else> · origin unknown</template>
      </p>
    </header>

    <form
      v-if="item.kind === 'COMPONENT' && item.composition"
      class="composition"
      @submit.prevent="saveComposition"
    >
      <p>
        Composition
        <span v-if="item.composition.origin === 'correction'" class="mark">Correction</span>
      </p>
      <label v-for="line in item.composition.lines" :key="line.id">
        {{ line.rawMaterial }}
        <input v-model="percentages[line.id]" type="number" step="1" />
        %
      </label>
      <button type="submit">Save composition</button>
    </form>

    <ul class="steps">
      <li v-for="step in item.steps" :key="step.id">
        <p>
          {{ processLabel(step.process) }}
          <span v-if="step.origin === 'correction'" class="mark">Correction</span>
        </p>
        <label>
          Supplier
          <select
            :value="step.supplierId ?? ''"
            @change="onSupplier(step.id, ($event.target as HTMLSelectElement).value)"
          >
            <option value="">Unknown</option>
            <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
              {{ supplier.name }}
            </option>
          </select>
          <span v-if="step.supplierOrigin === 'correction'" class="mark">Correction</span>
        </label>
        <label>
          Country
          <input
            :value="step.countryCode ?? ''"
            maxlength="2"
            @change="onCountry(step.id, ($event.target as HTMLInputElement).value)"
          />
          <span v-if="step.countryOrigin === 'correction'" class="mark">Correction</span>
        </label>
      </li>
    </ul>

    <form class="add-step" @submit.prevent="saveStep">
      <p>Add a step</p>
      <label>
        Process
        <select v-model="newProcess">
          <option v-for="process in processes" :key="process.code" :value="process.code">
            {{ process.label }}
          </option>
        </select>
      </label>
      <label>
        Supplier
        <select v-model="newSupplierId">
          <option value="">Unknown</option>
          <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
            {{ supplier.name }}
          </option>
        </select>
      </label>
      <label>
        Country
        <input v-model="newCountry" maxlength="2" />
      </label>
      <button type="submit">Add step</button>
    </form>

    <div v-if="item.children.length" class="children">
      <TreeItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :suppliers="suppliers"
        :processes="processes"
        @set-supplier="(stepId, supplierId) => emit('set-supplier', stepId, supplierId)"
        @set-country="(stepId, countryCode) => emit('set-country', stepId, countryCode)"
        @add-step="(itemId, draft) => emit('add-step', itemId, draft)"
        @set-composition="(componentId, lines) => emit('set-composition', componentId, lines)"
      />
    </div>
  </article>
</template>

<style scoped>
article {
  border-top: 1px solid #ccc;
  padding: 0.75rem 0 0.75rem 1rem;
}

.kind {
  margin: 0;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
}

h2 {
  margin: 0.1rem 0;
  font-size: 1.05rem;
}

label {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin: 0.25rem 0;
}

.mark {
  margin-left: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.steps,
.children {
  padding: 0;
  list-style: none;
}

.steps li {
  margin: 0.5rem 0;
}

button {
  margin-top: 0.35rem;
}
</style>
