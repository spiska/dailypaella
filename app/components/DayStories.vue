<script setup lang="ts">
import { importance } from '#shared/utils/importance'

defineProps<{
  day: string
  items: {
    id: number
    url: string
    titleEn: string
    summaryEn: string
    category: string | null
    score: number
    publishedAt: string
    sourceName: string
    sourceUrl: string
  }[]
}>()
</script>

<template>
  <section class="day">
    <h2 class="day-heading">
      <NuxtLink :to="`/day/${day}`">{{ formatDay(day) }}</NuxtLink>
    </h2>

    <ol class="stories">
      <li v-for="item in items" :key="item.id" class="story" :class="importance(item.score)">
        <p class="kicker">
          <a class="source" :href="item.sourceUrl" target="_blank" rel="noopener external">{{ item.sourceName }}</a>
          <template v-if="item.category">
            <span class="dot" aria-hidden="true" />
            <span>{{ item.category }}</span>
          </template>
          <span class="dot" aria-hidden="true" />
          <time :datetime="item.publishedAt">{{ formatMadridTime(item.publishedAt) }}</time>
        </p>
        <h3>
          <a :href="item.url" target="_blank" rel="noopener external">{{ item.titleEn }}</a>
        </h3>
        <p class="summary">{{ item.summaryEn }}</p>
        <a class="more" :href="item.url" target="_blank" rel="noopener external">
          Read the original <span aria-hidden="true">→</span>
        </a>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.day + .day {
  margin-top: 3rem;
}

.day-heading {
  margin: 0 0 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--text);
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.day-heading a {
  text-decoration: none;
}

.day-heading a:hover {
  color: var(--accent);
}

.stories {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Stories are separated by space first, with only a faint hairline between them. */
.story {
  padding: 1.75rem 0;
}

.story + .story {
  border-top: 1px solid var(--rule);
}

.story:first-child {
  padding-top: 0;
}

.story:last-child {
  padding-bottom: 0;
}

.kicker {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.5rem;
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.source {
  color: var(--accent);
  font-weight: 650;
  text-decoration: none;
}

.source:hover {
  text-decoration: underline;
}

.dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.6;
}

.story h3 {
  margin: 0 0 0.5rem;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.2;
  text-wrap: balance;
}

/* Importance is shown by headline size; the order stays chronological. */
.major h3 {
  font-size: clamp(1.75rem, 6.5vw, 2rem);
  font-weight: 650;
  line-height: 1.15;
}

.minor h3 {
  font-size: 1.1875rem;
  font-weight: 550;
  line-height: 1.3;
}

.story h3 a {
  text-decoration: none;
}

.story h3 a:hover {
  color: var(--accent);
}

.summary {
  margin: 0 0 0.75rem;
  text-wrap: pretty;
}

.more {
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
}

.more:hover {
  color: var(--accent);
}
</style>
