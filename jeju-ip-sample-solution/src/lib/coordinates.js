export function readVerifiedCoordinates(latitude, longitude) {
  if (latitude === '' || longitude === '' || latitude == null || longitude == null) return null
  const lat = Number(latitude), lng = Number(longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180 || (lat === 0 && lng === 0)) return null
  return { lat, lng }
}
