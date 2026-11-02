import { mergeCatalog } from '../lib/storyFilter'
import { MYTH_SCENES, MYTH_SOURCE } from './mythStories'
import verified from './external/verified-stories.json'

// 내장 항목 — 출처를 확인한 자료만. 분류는 자료가 밝히지 않아 미분류.
const BUILTIN = [
  { id: 'seolmundae', title: '설문대할망', category: 'unclassified', place: '제주돌문화공원',
    scenes: MYTH_SCENES.seolmundae, source: MYTH_SOURCE, verification: 'verified' },
  { id: 'samsinin', title: '탐라 삼신인', category: 'unclassified', place: '삼성혈',
    scenes: MYTH_SCENES.samsinin, source: MYTH_SOURCE, verification: 'verified' },
  // 혼인지는 확보된 자료가 없다 — 본문·이미지를 만들지 않고 검증 대기로 둔다.
  { id: 'honinji', title: '삼신인의 혼인', category: 'unclassified', place: '혼인지', verification: 'pending' },
]

export const STORY_CATALOG = mergeCatalog(BUILTIN, verified)
