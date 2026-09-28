<script setup lang="ts">
type ProductListItem = {
  id: string
  name: string
  reference: string
  lastChangedAt: string
} & (
  | { publication: 'never-published' }
  | {
      publication: 'published'
      version: number
      publishedAt: string
      workingTreeChanged: boolean
    }
)

const config = useRuntimeConfig()
const { data, error, status } = await useFetch<ProductListItem[]>(
  `${config.public.apiBase}/products`,
)

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function publicationLabel(item: ProductListItem): string {
  if (item.publication === 'never-published') {
    return 'Never published'
  }
  if (item.workingTreeChanged) {
    return `Version ${item.version} · working tree changed`
  }
  return `Version ${item.version}`
}
</script>

<template>
  <main>
    <h1>Traceability</h1>
    <p v-if="status === 'pending'">Loading products…</p>
    <p v-else-if="error">The product list could not be loaded.</p>
    <p v-else-if="!data?.length">No products.</p>
    <ul v-else>
      <li v-for="item in data" :key="item.id">
        <p class="name">{{ item.name }}</p>
        <p class="reference">{{ item.reference }}</p>
        <p>{{ publicationLabel(item) }}</p>
        <p>Last changed {{ formatWhen(item.lastChangedAt) }}</p>
      </li>
    </ul>
  </main>
</template>

<style scoped>
main {
  max-width: 40rem;
  margin: 2rem auto;
  font-family: sans-serif;
  line-height: 1.4;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  border-top: 1px solid #ccc;
  padding: 0.75rem 0;
}

.name {
  font-weight: 600;
  margin: 0;
}

.reference,
p {
  margin: 0.15rem 0;
}
</style>
