import test from 'node:test'
import assert from 'node:assert/strict'
import { buildFavoriteMedia } from '../src/lib/favorite-media.js'

test('story favorites use their shared pixel-art thumbnail', () => {
  const result = buildFavoriteMedia([{ storyId: 'seolmundae' }], {
    stories: [{ id: 'seolmundae', thumbnailImage: '/myth-pixel/seolmundae-scene-01.jpg' }],
  })
  assert.equal(result.seolmundae.image, '/myth-pixel/seolmundae-scene-01.jpg')
})

test('TourAPI favorites use the image from the exact saved content ID', () => {
  const result = buildFavoriteMedia([{ storyId: 'tour:123', storyTitle: '돌문화공원' }], {
    tourDetails: { 123: { image: 'https://tour.example/123.jpg', imageSource: '한국관광공사 TourAPI' } },
  })
  assert.equal(result['tour:123'].image, 'https://tour.example/123.jpg')
  assert.equal(result['tour:123'].imageSource, '한국관광공사 TourAPI')
  assert.equal(buildFavoriteMedia([{ storyId: 'tour:not-an-id' }], { tourDetails: { 'not-an-id': { image: '/wrong.jpg' } } })['tour:not-an-id'], undefined)
})

test('heritage favorite images require an exact saved name and retain attribution', () => {
  const favorites = [
    { storyId: 'heritage:관덕정', storyTitle: '관덕정' },
    { storyId: 'heritage:관덕정 근처', storyTitle: '관덕정 근처' },
  ]
  const result = buildFavoriteMedia(favorites, { heritageRecords: [
    { name: '관 덕정', image: 'https://heritage.example/approved.jpg', imageSource: '국가유산청 국가유산포털', imageLicense: '공공누리 제1유형' },
  ] })
  assert.equal(result['heritage:관덕정'].image, 'https://heritage.example/approved.jpg')
  assert.equal(result['heritage:관덕정'].imageLicense, '공공누리 제1유형')
  assert.equal(result['heritage:관덕정 근처'], undefined)
})
