<script setup lang="ts">
type WorkingTree = {
  id: string
  name: string
  reference: string
  lastChangedAt: string
  versions: { number: number; publishedAt: string }[]
  root: {
    id: string
    kind: 'PRODUCT' | 'COMPONENT' | 'MATERIAL'
    label: string
    steps: {
      id: string
      process: string
      supplierId: string | null
      supplierName: string | null
      supplierOrigin: 'declaration' | 'correction'
      countryCode: string | null
      countryOrigin: 'declaration' | 'correction'
      origin: 'declaration' | 'correction'
    }[]
    children: WorkingTree['root'][]
    usageCategory?: string
    usagePercentage?: number
    composition?: {
      lines: {
        id: string
        rawMaterial: string
        percentage: number
        originCountryCode: string | null
      }[]
      origin: 'declaration' | 'correction'
    }
    rawMaterial?: string
    originCountryCode?: string | null
  }
}

type Supplier = { id: string; name: string }
type ProcessOption = { code: string; label: string }

const route = useRoute()
const config = useRuntimeConfig()
const base = config.public.apiBase
const productId = computed(() => String(route.params.id))

const { data: tree, error, status } = await useFetch<WorkingTree>(
  () => `${base}/products/${productId.value}/working-tree`,
  { getCachedData: () => undefined },
)
const { data: suppliers } = await useFetch<Supplier[]>(`${base}/suppliers`)
const { data: processes } = await useFetch<ProcessOption[]>(`${base}/processes`)

const actionError = ref('')

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function messageFrom(cause: unknown): string {
  if (typeof cause === 'object' && cause !== null && 'data' in cause) {
    const data = cause.data
    if (
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof data.message === 'string'
    ) {
      return data.message
    }
  }
  return 'The change could not be saved.'
}

async function post(path: string, body: unknown) {
  actionError.value = ''
  try {
    tree.value = await $fetch<WorkingTree>(`${base}${path}`, {
      method: 'POST',
      body,
    })
  } catch (cause) {
    actionError.value = messageFrom(cause)
  }
}

function setSupplier(stepId: string, supplierId: string | null) {
  return post(`/products/${productId.value}/steps/${stepId}/supplier`, {
    supplierId,
  })
}

function setCountry(stepId: string, countryCode: string | null) {
  return post(`/products/${productId.value}/steps/${stepId}/country`, {
    countryCode,
  })
}

function addStep(
  itemId: string,
  draft: { process: string; supplierId: string | null; countryCode: string | null },
) {
  return post(`/products/${productId.value}/items/${itemId}/steps`, draft)
}

function setComposition(
  componentId: string,
  lines: { id: string; percentage: number }[],
) {
  return post(
    `/products/${productId.value}/components/${componentId}/composition`,
    { lines },
  )
}

function publish() {
  return post(`/products/${productId.value}/publish`, {})
}
</script>

<template>
  <main>
    <p><NuxtLink to="/">All products</NuxtLink></p>
    <p v-if="status === 'pending'">Loading tree…</p>
    <p v-else-if="error">This product could not be loaded.</p>
    <template v-else-if="tree">
      <h1>{{ tree.name }}</h1>
      <p>{{ tree.reference }}</p>
      <p>Last changed {{ formatWhen(tree.lastChangedAt) }}</p>
      <p>
        <button type="button" @click="publish">Publish</button>
      </p>
      <ul v-if="tree.versions.length">
        <li v-for="version in tree.versions" :key="version.number">
          <NuxtLink :to="`/products/${tree.id}/versions/${version.number}`">
            Version {{ version.number }}
          </NuxtLink>
          published {{ formatWhen(version.publishedAt) }}
        </li>
      </ul>
      <p v-if="actionError" class="error">{{ actionError }}</p>
      <TreeItem
        :item="tree.root"
        :suppliers="suppliers ?? []"
        :processes="processes ?? []"
        @set-supplier="setSupplier"
        @set-country="setCountry"
        @add-step="addStep"
        @set-composition="setComposition"
      />
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

.error {
  color: #8a1f1f;
  font-weight: 600;
}

ul {
  padding-left: 1.1rem;
}
</style>
