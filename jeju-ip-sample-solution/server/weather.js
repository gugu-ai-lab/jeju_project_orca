// 기상청 단기예보 조회서비스 (VilageFcstInfoService_2.0)
const BASE = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';
const GRID = { '제주시': [53, 38], '서귀포시': [52, 33] }; // 기상청 격자 좌표(nx, ny)
const SKY = { 1: '맑음', 3: '구름많음', 4: '흐림' };
const PTY = { 0: '없음', 1: '비', 2: '비/눈', 3: '눈', 4: '소나기' };

// 발표시각: 02·05·08·11·14·17·20·23시 (발표 후 약 10분 뒤부터 조회 가능)
function baseDateTime() {
  const kst = new Date(Date.now() + 9 * 3600e3 - 15 * 60e3); // 한국시간, 15분 여유
  let h = [23, 20, 17, 14, 11, 8, 5, 2].find((x) => x <= kst.getUTCHours());
  let day = kst;
  if (h === undefined) { day = new Date(kst.getTime() - 24 * 3600e3); h = 23; }
  return {
    base_date: day.toISOString().slice(0, 10).replaceAll('-', ''),
    base_time: String(h).padStart(2, '0') + '00',
  };
}

export async function getWeather({ place = '제주시' } = {}) {
  const [nx, ny] = GRID[place] ?? GRID['제주시'];
  const key = process.env.DATA_GO_KR_KEY?.trim()
  if (!key) throw new Error('DATA_KEY_MISSING')
  const params = new URLSearchParams({
    serviceKey: key,
    dataType: 'JSON', numOfRows: '300', pageNo: '1',
    nx: String(nx), ny: String(ny), ...baseDateTime(),
  });
  let r
  try { r = await fetch(BASE + '?' + params, { signal: AbortSignal.timeout(12000) }) }
  catch { throw new Error('UPSTREAM_UNAVAILABLE') }
  if (!r.ok) throw new Error(r.status === 401 || r.status === 403 ? 'DATA_AUTH_REQUIRED' : 'UPSTREAM_UNAVAILABLE')
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error('UPSTREAM_UNAVAILABLE'); }

  if (String(data?.response?.header?.resultCode) !== '00') throw new Error('UPSTREAM_UNAVAILABLE')
  const items = data?.response?.body?.items?.item ?? [];
  if (!items.length) throw new Error('UPSTREAM_UNAVAILABLE')
  const forecast = normalizeForecast(items, place)
  if (!forecast.length) throw new Error('UPSTREAM_UNAVAILABLE')
  return forecast
}

// 기상청은 과거 시간대도 포함할 수 있으므로 현재 KST 시간대 이후만 제공한다.
export function normalizeForecast(items, place, now = Date.now()) {
  const kst = new Date(now + 9 * 3600e3)
  const firstHour = kst.toISOString().slice(0, 10).replaceAll('-', '') + ' ' + String(kst.getUTCHours()).padStart(2, '0') + '00'
  const slots = {}
  for (const it of items) {
    const key = it.fcstDate + ' ' + it.fcstTime
    ;(slots[key] ??= {})[it.category] = it.fcstValue
  }
  return Object.entries(slots).filter(([time]) => time >= firstHour)
    .sort(([left], [right]) => left.localeCompare(right)).slice(0, 6).map(([time, v]) => ({
      id: time, title: place + ' ' + time + ' 예보', place, time,
      temp: v.TMP === undefined ? null : Number(v.TMP), sky: SKY[v.SKY] ?? v.SKY,
      rain: PTY[v.PTY] ?? v.PTY, pop: v.POP === undefined ? null : Number(v.POP),
    }))
}
