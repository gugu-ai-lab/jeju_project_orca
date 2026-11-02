import { mergeCatalog, isVerified } from '../lib/storyFilter.js'
import { STUDENT_STORIES } from './studentStories.js'
import pins from './jejuMapPins.json' with { type: 'json' }
import verified from './external/verified-stories.json' with { type: 'json' }

// 이야기 출처 검증과 관광 장소 검증은 별개다. 장소가 없어도 이야기 목록에 포함한다.
const categories = { seolmundae: 'myth', samsinin: 'myth', honinji: 'myth', suwolbong: 'legend', sanbangdeok: 'legend', yeongdeung: 'myth', jacheongbi: 'myth' }
const aliases = { samsinin: ['삼성혈', '삼성혈 개국 신화'], honinji: ['삼신인의 혼인', '삼신인과 벽랑국 3공주의 혼인'] }
const builtin = STUDENT_STORIES.map(story => {
  const pin = pins.find(p => p.mythId === story.id)
  return { ...story, category: categories[story.id], summary: story.shortIntro,
    aliases: aliases[story.id] || [], verification: 'verified', featured: true,
    verificationDocument: 'MYTH_CONTENT_VERIFICATION.md', adaptation: 'Gemini 학생용 풀이',
    mapPin: pin ? { hasLocation: pin.hasVerifiedLocation, emoji: pin.emoji, shortPlace: pin.placeName,
      fullPlace: pin.fullPlaceName, lat: pin.realGeoCoords?.lat, lng: pin.realGeoCoords?.lng,
      verifiedNote: pin.verifiedNote } : undefined,
  }
})
// 동일 ID는 하나의 이야기다. 외부 검증 데이터는 기존 ID를 유지하며 갱신한다.
export const STORY_CATALOG = mergeCatalog(builtin, verified)
export const HOME_STORIES = STORY_CATALOG.filter(s => s.featured && isVerified(s)).slice(0, 7)
export const VERIFIED_PLACE_COUNT = pins.filter(p => p.hasVerifiedLocation && p.realGeoCoords).length
