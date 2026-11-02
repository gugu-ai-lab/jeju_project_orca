import pins from '../src/data/jejuMapPins.json' with { type: 'json' }
import { toForecastGrid } from './weather-grid.js'
import { getWeather } from './weather.js'
const cache = new Map()
export async function getPlaceWeather(mythId, { now = Date.now(), fetchImpl = globalThis.fetch } = {}) {
  const pin = pins.find(p => p.mythId === mythId)
  if (!pin?.hasVerifiedLocation || !pin.realGeoCoords || !pin.location?.address) throw new Error('LOCATION_UNAVAILABLE')
  const grid = toForecastGrid(pin.realGeoCoords.lat, pin.realGeoCoords.lng)
  // 장소 식별자를 유지하여 다른 장소의 응답이 섞이지 않도록 한다.
  const key = mythId
  if (fetchImpl === globalThis.fetch && cache.get(key)?.expires > now) return cache.get(key).value
  const result = await getWeather({ place: pin.location.name, grid, now, fetchImpl, withMetadata: true })
  const value = { ...result, mythId, location: { name: pin.location.name, address: pin.location.address, latitude: pin.realGeoCoords.lat, longitude: pin.realGeoCoords.lng } }
  if (fetchImpl === globalThis.fetch) cache.set(key, { value, expires: now + 180000 })
  return value
}
