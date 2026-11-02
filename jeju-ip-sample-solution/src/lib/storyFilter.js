// 이야기 카탈로그 검색·분류 — 순수 함수(화면과 무관).
export const CATEGORY_LABEL = { myth: '신화', legend: '전설', folktale: '민담', unclassified: '미분류' }

const norm = (s) => String(s ?? '').normalize('NFC').toLowerCase().replace(/\s+/g, '')

export function isVerified(story) {
  return story.verification === 'verified' && !!story.source
}

// 외부 입력을 안전하게 정규화 — 필수 필드(id, title)가 없는 항목은 버린다.
export function normalizeStory(raw) {
  if (!raw || !raw.id || !raw.title) return null
  const category = CATEGORY_LABEL[raw.category] ? raw.category : 'unclassified'
  return { ...raw, category, scenes: Array.isArray(raw.scenes) ? raw.scenes : [] }
}

export function mergeCatalog(...lists) {
  const byId = new Map()
  for (const list of lists) for (const raw of list ?? []) {
    const previous = byId.get(raw?.id)
    const s = normalizeStory(previous ? { ...previous, ...raw, scenes: raw.scenes ?? previous.scenes } : raw)
    if (s) byId.set(s.id, s) // 뒤쪽 목록(검증 결과)이 같은 id 를 덮어쓴다
  }
  return [...byId.values()]
}

// query: 제목·요약·장소 부분 일치 / category: 'all' 또는 분류 / onlyVerified / onlyWithImage
export function filterStories(stories, { query = '', category = 'all', onlyVerified = false, onlyWithImage = false } = {}) {
  const q = norm(query)
  return stories.filter((s) => {
    if (category !== 'all' && s.category !== category) return false
    if (onlyVerified && !isVerified(s)) return false
    if (onlyWithImage && !s.scenes.some((sc) => sc.image)) return false
    if (!q) return true
    return [s.title, s.summary, s.place, ...(s.aliases || [])].some((f) => norm(f).includes(q))
  })
}

// 현재 데이터에 실제로 존재하는 분류만 필터 칩으로 보여주기 위함
export function presentCategories(stories) {
  return [...new Set(stories.map((s) => s.category))]
}
