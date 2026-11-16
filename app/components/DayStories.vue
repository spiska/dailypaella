<script setup lang="ts">
import { importance } from '#shared/utils/importance'

type Item = {
  id: number
  url: string
  titleEn: string
  summaryEn: string
  category: string | null
  score: number
  publishedAt: string
  sourceName: string
  sourceUrl: string
}

defineProps<{
  day: string
  items: Item[]
}>()

/** Lighter stories are kept, but shown as a headline only, whatever their score. */
const BRIEF_CATEGORIES = new Set(['lifestyle'])
const isBrief = (item: Item) => item.category !== null && BRIEF_CATEGORIES.has(item.category)
const tier = (item: Item) => (isBrief(item) ? 'brief' : importance(item.score))

/**
 * Umami data attributes for a click on an article link. Only facts about the
 * story are sent, nothing about the reader. Values are recorded as strings.
 */
function clickEvent(item: Item, link: 'headline' | 'read-more') {
  return {
    'data-umami-event': 'article-click',
    'data-umami-event-source': item.sourceName,
    'data-umami-event-title': item.titleEn.slice(0, 200),
    'data-umami-event-importance': importance(item.score),
    'data-umami-event-score': String(item.score),
    'data-umami-event-category': item.category ?? 'none',
    'data-umami-event-link': link,
  }
}

// The heading is sticky; a zero-height marker right above it scrolls off the
// top exactly when the heading starts sticking, which reveals the small logo.
const marker = ref<HTMLElement>()
const stuck = ref(false)
let observer: IntersectionObserver | undefined

onMounted(() => {
  if (!marker.value) return
  observer = new IntersectionObserver(([entry]) => {
    stuck.value = !!entry && !entry.isIntersecting && entry.boundingClientRect.top < 0
  })
  observer.observe(marker.value)
})

onBeforeUnmount(() => observer?.disconnect())

function scrollToTop() {
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
}
</script>

<template>
  <section class="day">
    <div ref="marker" class="stick-marker" aria-hidden="true" />
    <h2 class="day-heading" :class="{ stuck }">
      <button
        class="home-icon"
        type="button"
        :tabindex="stuck ? 0 : -1"
        :aria-hidden="!stuck"
        aria-label="Back to top"
        @click="scrollToTop"
      >
        <img src="/logo.png" alt="" width="22" height="22" />
      </button>
      <NuxtLink :to="`/day/${day}`">{{ formatDay(day) }}</NuxtLink>
    </h2>

    <ol class="stories">
      <li v-for="item in items" :key="item.id" class="story" :class="tier(item)">
        <p class="kicker">
          <a
            class="source"
            :href="item.sourceUrl"
            target="_blank"
            rel="noopener external"
            data-umami-event="source-click"
            :data-umami-event-source="item.sourceName"
          >{{ item.sourceName }}</a>
          <template v-if="item.category">
            <span class="dot" aria-hidden="true" />
            <span>{{ item.category }}</span>
          </template>
          <span class="dot" aria-hidden="true" />
          <time :datetime="item.publishedAt">{{ formatMadridTime(item.publishedAt) }}</time>
        </p>
        <h3>
          <a :href="item.url" target="_blank" rel="noopener external" v-bind="clickEvent(item, 'headline')">{{ item.titleEn }}</a>
        </h3>
        <p v-if="!isBrief(item)" class="summary">{{ item.summaryEn }}</p>
        <a v-if="!isBrief(item)" class="more" :href="item.url" target="_blank" rel="noopener external" v-bind="clickEvent(item, 'read-more')">
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

/* Stays pinned to the top while its day scrolls past; the next day pushes it out. */
.day-heading {
  position: sticky;
  top: 0;
  z-index: 1;
  margin: 0 0 1.5rem;
  padding: 0.75rem 0 0.5rem;
  background: var(--bg);
  border-bottom: 1px solid var(--text);
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.day-heading {
  display: flex;
  align-items: center;
}

.stick-marker {
  height: 0;
}

/* Small logo that slides in while the heading is stuck; it scrolls to the top. */
.home-icon {
  display: flex;
  flex: none;
  width: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  background: none;
  cursor: pointer;
  opacity: 0;
  transition:
    width 0.2s ease,
    margin 0.2s ease,
    opacity 0.2s ease;
}

.home-icon img {
  flex: none;
}

.stuck .home-icon {
  width: 22px;
  margin-right: 0.625rem;
  opacity: 1;
}

.home-icon:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 50%;
}

@media (prefers-reduced-motion: reduce) {
  .home-icon {
    transition: none;
  }
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

.stories > .story:first-child {
  padding-top: 0;
}

.stories > .story:last-child {
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
  font-size: 1.375rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.2;
  text-wrap: balance;
}

/*
 * Importance is shown by size and weight; the order stays chronological.
 * Major stories get a much larger headline and more room. Minor ones are
 * compact, with a smaller, quieter summary. Brief ones (light categories)
 * show only the headline.
 */
.story.major {
  padding-block: 2.25rem;
}

.major h3 {
  margin-bottom: 0.625rem;
  font-size: clamp(1.875rem, 8vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.major .summary {
  font-size: 1.0625rem;
}

.story.minor {
  padding-block: 1.25rem;
}

.minor h3 {
  margin-bottom: 0.375rem;
  font-size: 1.125rem;
  font-weight: 550;
  line-height: 1.3;
}

.minor .summary {
  margin-bottom: 0.5rem;
  color: var(--muted);
  font-size: 0.9375rem;
}

.minor .more {
  font-size: 0.8125rem;
}

/* Lifestyle and similar light stories: a small headline, no summary. */
.story.brief {
  padding-block: 0.875rem;
}

.brief .kicker {
  margin-bottom: 0.25rem;
  font-size: 0.6875rem;
}

.brief h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.35;
}

.story h3 a {
  text-decoration: none;
}

/*
 * Unread headlines use the strongest text colour, already-read ones fade to
 * grey. Browsers only allow colour changes for visited links.
 */
.story h3 a:link {
  color: var(--text-strong);
}

.story h3 a:visited {
  color: var(--muted);
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
