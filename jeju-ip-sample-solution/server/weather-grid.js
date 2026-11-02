// 기상청 동네예보 LCC 투영: 5km, 기준점 38N/126E -> (43,136).
export function toForecastGrid(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < 32 || lat > 35 || lng < 124 || lng > 128) throw new Error('INVALID_LOCATION')
  const rad = Math.PI / 180, re = 6371.00877 / 5
  const a = 30 * rad, b = 60 * rad
  const sn = Math.log(Math.cos(a) / Math.cos(b)) / Math.log(Math.tan(Math.PI / 4 + b / 2) / Math.tan(Math.PI / 4 + a / 2))
  const sf = Math.pow(Math.tan(Math.PI / 4 + a / 2), sn) * Math.cos(a) / sn
  const ro = re * sf / Math.pow(Math.tan(Math.PI / 4 + 38 * rad / 2), sn)
  const ra = re * sf / Math.pow(Math.tan(Math.PI / 4 + lat * rad / 2), sn)
  const theta = (lng - 126) * rad * sn
  return { nx: Math.floor(ra * Math.sin(theta) + 43 + 0.5), ny: Math.floor(ro - ra * Math.cos(theta) + 136 + 0.5) }
}
