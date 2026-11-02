import { getWeather } from '../server/weather.js'
import { getPlaceWeather } from '../server/place-weather.js'
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: '조회 요청만 사용할 수 있어요.' })
  try {
    res.setHeader?.('Cache-Control', 'no-store')
    return res.status(200).json(req.query.mythId !== undefined
      ? await getPlaceWeather(req.query.mythId)
      : await getWeather({ place: req.query.place }))
  } catch (error) {
    const noLocation = error.message === 'LOCATION_UNAVAILABLE'
    return res.status(noLocation ? 400 : 503).json({ code: noLocation ? 'LOCATION_UNAVAILABLE' : 'WEATHER_UNAVAILABLE',
      error: noLocation ? '확인된 실제 장소가 없어 예보를 표시하지 않아요.' : '예보를 불러오지 못했어요. 잠시 후 다시 확인해 주세요.' })
  }
}
