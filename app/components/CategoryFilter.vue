<script setup lang="ts">
defineProps<{
  categories: readonly string[]
  selected: string | null
}>()

const emit = defineEmits<{ select: [category: string | null] }>()

const label = (category: string) => category.charAt(0).toUpperCase() + category.slice(1)
</script>

<template>
  <nav v-if="categories.length > 1" class="filter" aria-label="Filter by category">
    <button
      type="button"
      :aria-pressed="selected === null"
      data-umami-event="category-filter"
      data-umami-event-category="all"
      @click="emit('select', null)"
    >
      All
    </button>
    <button
      v-for="category in categories"
      :key="category"
      type="button"
      :aria-pressed="selected === category"
      data-umami-event="category-filter"
      :data-umami-event-category="category"
      @click="emit('select', selected === category ? null : category)"
    >
      {{ label(category) }}
    </button>
  </nav>
</template>

<style scoped>
.filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 2rem;
}

button {
  padding: 0.3rem 0.8rem;
  border: 1px solid var(--rule);
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
}

button:hover {
  border-color: var(--muted);
  color: var(--text);
}

button[aria-pressed='true'] {
  border-color: var(--text);
  background: var(--text);
  color: var(--bg);
}

button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
