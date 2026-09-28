<script setup lang="ts">
type FrozenTree = {
  id: string
  kind: 'PRODUCT' | 'COMPONENT' | 'MATERIAL'
  label: string
  steps: {
    id: string
    process: string
    supplierName: string | null
    countryCode: string | null
  }[]
  children: FrozenTree[]
  usageCategory?: string
  usagePercentage?: number
  composition?: {
    id: string
    rawMaterial: string
    percentage: number
    originCountryCode: string | null
  }[]
  rawMaterial?: string
  originCountryCode?: string | null
}

type PublishedTree = {
  id: string
  name: string
  reference: string
  number: number
  publishedAt: string
  root: FrozenTree
}

type ProcessOption = { code: string; label: string }

const route = useRoute()
const config = useRuntimeConfig()
const base = config.public.apiBase
const productId = computed(() => String(route.params.id))
const versionNumber = computed(() => String(route.params.number))

const { data: version, error, status } = await useFetch<PublishedTree>(
  () => `${base}/products/${productId.value}/versions/${versionNumber.value}`,
  { getCachedData: () => undefined },
)
const { data: processes } = await useFetch<ProcessOption[]>(`${base}/processes`)

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
</script>

<template>
  <main>
    <p>
      <NuxtLink :to="`/products/${productId}`">Working tree</NuxtLink>
    </p>
    <p v-if="status === 'pending'">Loading version…</p>
    <p v-else-if="error">This version could not be loaded.</p>
    <template v-else-if="version">
      <h1>{{ version.name }}</h1>
      <p>{{ version.reference }}</p>
      <p>Version {{ version.number }} · read only</p>
      <p>Published {{ formatWhen(version.publishedAt) }}</p>
      <FrozenTree :item="version.root" :processes="processes ?? []" />
    </template>
  </main>
</template>

<style scoped>
main {
  max-width: 46rem;
  margin: 2rem auto;
  font-family: sans-serif;
  line-height: 1.4;
}
</style>
