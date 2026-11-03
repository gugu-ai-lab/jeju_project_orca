import { STUDENT_STORIES } from '../src/data/studentStories.js'

const IGNORED = new Set(['신화', '전설', '이야기', '내용', '관련', '관련된', '알려줘', '알려주세요', '소개', '무엇', '뭐야', '누구', '누구야', '있나요', '알고', '싶어', '말해줘', '말해주세요'])
const PARTICLES = /(으로부터|에게서|에서|으로|에게|부터|까지|처럼|하고|께서|은|는|이|가|을|를|에|와|과|의|도|만|로|랑)$/u

function terms(query) {
  return String(query || '').toLocaleLowerCase('ko-KR')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/u)
    .map(token => token.replace(PARTICLES, ''))
    .filter(token => token.length > 1 && !IGNORED.has(token))
}

function searchableFields(story) {
  return {
    title: story.title || '',
    place: [story.place, story.placeBridge?.placeName].filter(Boolean).join(' '),
    summary: [story.shortIntro, story.placeBridge?.summary].filter(Boolean).join(' '),
    other: [story.tag, story.question, ...(story.scenes || []).flatMap(scene => [scene.caption, scene.termTip, ...(scene.studentLines || [])])].filter(Boolean).join(' '),
  }
}

export function searchStoryContent(keyword, stories = STUDENT_STORIES) {
  const queryTerms = terms(keyword)
  if (queryTerms.length === 0) return []

  return stories.map(story => {
    const fields = searchableFields(story)
    const normalized = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, value.toLocaleLowerCase('ko-KR').replace(/\s+/gu, '')]))
    const score = queryTerms.reduce((total, term) => {
      const q = term.replace(/\s+/gu, '')
      return total + (normalized.title.includes(q) ? 8 : 0)
        + (normalized.place.includes(q) ? 6 : 0)
        + (normalized.summary.includes(q) ? 4 : 0)
        + (normalized.other.includes(q) ? 2 : 0)
    }, 0)
    return { story, score }
  }).filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ story }) => ({
      id: story.id,
      title: story.title,
      place: story.place,
      description: story.shortIntro,
      content: (story.scenes || []).flatMap(scene => scene.studentLines || []).join(' '),
    }))
}
