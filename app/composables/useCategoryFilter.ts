// Category filter shared by all pages. The selection lives in app state and is
// mirrored to `?category=` so a filtered view can be shared or bookmarked.
//
// Pages are cached without their query string, so the server always renders
// the unfiltered list; the filter is applied after the page has loaded in the
// browser. Doing it earlier would make the server and browser render differ.

/** Same order and values as the allowed categories in the summary prompt. */
export const CATEGORIES = ['politics', 'economy', 'society', 'world', 'culture', 'sports', 'science', 'other'] as const

interface Story {
  category: string | null
}

export function useCategoryFilter() {
  const route = useRoute()
  const router = useRouter()
  const selected = useState<string | null>('category-filter', () => null)
  const ready = useState('category-filter-ready', () => false)

  function syncUrl() {
    const current = typeof route.query.category === 'string' ? route.query.category : null
    if (current === selected.value) return
    router.replace({ query: { ...route.query, category: selected.value ?? undefined } })
  }

  onMounted(() => {
    const fromUrl = route.query.category
    if (typeof fromUrl === 'string' && (CATEGORIES as readonly string[]).includes(fromUrl)) {
      selected.value = fromUrl
    }
    ready.value = true
    syncUrl()
  })

  function select(category: string | null) {
    selected.value = category
    syncUrl()
  }

  /** Categories present in these stories, in the canonical order. */
  function available(stories: Story[]) {
    const present = new Set(stories.map((s) => s.category))
    return CATEGORIES.filter((c) => present.has(c))
  }

  /** Keeps only matching stories, dropping days that end up empty. */
  function apply<T extends { items: Story[] }>(days: T[]): T[] {
    const category = ready.value ? selected.value : null
    if (!category) return days
    return days
      .map((day) => ({ ...day, items: day.items.filter((s) => s.category === category) }))
      .filter((day) => day.items.length > 0)
  }

  return { selected, select, available, apply }
}
