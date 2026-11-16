<script setup lang="ts">
const route = useRoute()
const day = String(route.params.date)

if (!isValidDay(day)) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data, error } = await useFetch('/api/overview', { query: { day } })

useHead({ title: `${formatDay(day)} · The Daily Paella` })

const filter = useCategoryFilter()
const categories = computed(() => filter.available(data.value?.days.flatMap((d) => d.items) ?? []))
const days = computed(() => filter.apply(data.value?.days ?? []))
</script>

<template>
  <p class="back"><NuxtLink to="/"><span aria-hidden="true">←</span> Latest</NuxtLink></p>

  <p v-if="error" class="notice">This day is unavailable right now. Please try again later.</p>

  <template v-else>
    <CategoryFilter :categories="categories" :selected="filter.selected.value" @select="filter.select" />
    <DayStories v-if="days.length" :day="day" :items="days[0]!.items" />
    <template v-else>
      <h2 class="empty-heading">{{ formatDay(day) }}</h2>
      <p class="notice">
        {{ data?.days.length ? `No ${filter.selected.value} stories for this day.` : 'No stories for this day.' }}
      </p>
    </template>
    <DayNav :older="data?.older ?? null" :newer="data?.newer ?? null" />
  </template>
</template>

<style scoped>
.back {
  margin: 0 0 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.back a {
  color: var(--muted);
  text-decoration: none;
}

.back a:hover {
  color: var(--accent);
}

.empty-heading {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
}

.notice {
  color: var(--muted);
  text-align: center;
  padding: 2rem 0;
}
</style>
