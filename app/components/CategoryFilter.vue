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
/*
 * Always one row. On wide screens all categories fit (sized so that every
 * category plus "All" fits the 40rem column); on narrow ones the row
 * scrolls sideways instead of wrapping, with the edge fading out as a hint.
 */
.filter {
  display: flex;
  gap: 0.25rem;
  margin: 0 0 2rem;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  mask-image: linear-gradient(to right, #000 calc(100% - 1.5rem), transparent);
}

.filter::-webkit-scrollbar {
  display: none;
}

/* No fade when everything fits (wide screens). */
@media (min-width: 42rem) {
  .filter {
    mask-image: none;
  }
}

button {
  flex: none;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--rule);
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: 0.78125rem;
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
