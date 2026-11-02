const STORY_IDS = [
  'seolmundae',
  'samsinin',
  'honinji',
  'jacheongbi',
  'suwolbong',
  'sanbangdeok',
  'yeongdeung',
]

function createStoryArt(storyId) {
  const firstScene = `/myth-pixel/${storyId}-scene-01-pixel-16x9.jpg`
  const secondScene = `/myth-pixel/${storyId}-scene-02-pixel-16x9.jpg`

  return Object.freeze({
    thumbnailImage: firstScene,
    storybookImages: Object.freeze([firstScene, secondScene]),
    puzzleImage: secondScene,
    width: 1376,
    height: 768,
  })
}

// 모든 화면과 퍼즐이 공유하는 신화별 픽셀 아트 경로.
export const MYTH_PIXEL_ART = Object.freeze(
  Object.fromEntries(STORY_IDS.map((storyId) => [storyId, createStoryArt(storyId)]))
)
