<script setup lang="ts">
const { data, error } = await useFetch('/api/overview')

const filter = useCategoryFilter()
const categories = computed(() => filter.available(data.value?.days.flatMap((d) => d.items) ?? []))
const days = computed(() => filter.apply(data.value?.days ?? []))
</script>

<template>
  <p v-if="error" class="notice">The overview is unavailable right now. Please try again later.</p>

  <p v-else-if="!data?.days.length" class="notice">No stories yet. Check back soon.</p>

  <template v-else>
    <CategoryFilter :categories="categories" :selected="filter.selected.value" @select="filter.select" />
    <DayStories v-for="group in days" :key="group.day" :day="group.day" :items="group.items" />
    <p v-if="!days.length" class="notice">No {{ filter.selected.value }} stories in these days.</p>
    <DayNav :older="data.older" :newer="null" />
  </template>
</template>

<style scoped>
.notice {
  color: var(--muted);
  text-align: center;
  padding: 2rem 0;
}
</style>
