const normalizedName = value => String(value || '').trim().replace(/\s+/g, '')

function imageUrl(value) {
  return typeof value === 'string' ? value : value?.src || ''
}

export function buildFavoriteMedia(favorites, { stories = [], tourDetails = {}, heritageRecords = [] } = {}) {
  const media = {}
  const storiesById = new Map(stories.map(story => [story.id, story]))
  const heritageByName = new Map(heritageRecords.map(record => [normalizedName(record.name), record]))

  for (const favorite of favorites) {
    const story = storiesById.get(favorite.storyId)
    if (story) {
      const image = imageUrl(story.thumbnailImage) || imageUrl(story.scenes?.find(scene => scene.image)?.image)
      if (image) media[favorite.storyId] = { image }
      continue
    }

    if (favorite.storyId.startsWith('tour:')) {
      const contentId = favorite.storyId.slice('tour:'.length)
      const detail = tourDetails[contentId]
      if (/^\d{1,20}$/.test(contentId) && detail?.image) media[favorite.storyId] = {
        image: detail.image,
        imageSource: detail.imageSource || '한국관광공사 TourAPI',
      }
      continue
    }

    if (favorite.storyId.startsWith('heritage:')) {
      const record = heritageByName.get(normalizedName(favorite.storyTitle))
      if (record?.image) media[favorite.storyId] = {
        image: record.image,
        imageCaption: record.imageCaption,
        imageSource: record.imageSource,
        imageSourceUrl: record.imageSourceUrl,
        imageLicense: record.imageLicense,
        imageLicenseUrl: record.imageLicenseUrl,
      }
    }
  }
  return media
}
