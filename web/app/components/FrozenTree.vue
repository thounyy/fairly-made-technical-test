<script setup lang="ts">
type CompositionLine = {
  id: string
  rawMaterial: string
  percentage: number
  originCountryCode: string | null
}

type Step = {
  id: string
  process: string
  supplierName: string | null
  countryCode: string | null
}

type FrozenItem = {
  id: string
  kind: 'PRODUCT' | 'COMPONENT' | 'MATERIAL'
  label: string
  steps: Step[]
  children: FrozenItem[]
  usageCategory?: string
  usagePercentage?: number
  composition?: CompositionLine[]
  rawMaterial?: string
  originCountryCode?: string | null
}

type ProcessOption = { code: string; label: string }

const props = defineProps<{
  item: FrozenItem
  processes: ProcessOption[]
}>()

defineOptions({ name: 'FrozenTree' })

function processLabel(code: string): string {
  return props.processes.find((process) => process.code === code)?.label ?? code
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

    <section v-if="item.kind === 'COMPONENT' && item.composition">
      <p>Composition</p>
      <ul>
        <li v-for="line in item.composition" :key="line.id">
          {{ line.rawMaterial }} {{ line.percentage }}%
        </li>
      </ul>
    </section>

    <ul class="steps">
      <li v-for="step in item.steps" :key="step.id">
        <p>{{ processLabel(step.process) }}</p>
        <p>Supplier {{ step.supplierName ?? 'Unknown' }}</p>
        <p>Country {{ step.countryCode ?? 'Unknown' }}</p>
      </li>
    </ul>

    <div v-if="item.children.length" class="children">
      <FrozenTree
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :processes="processes"
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

.steps,
.children {
  padding: 0;
  list-style: none;
}

.steps li {
  margin: 0.5rem 0;
}

p {
  margin: 0.15rem 0;
}
</style>
