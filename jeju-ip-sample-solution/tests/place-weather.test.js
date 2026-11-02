import test from 'node:test'
import assert from 'node:assert/strict'
import { toForecastGrid } from '../server/weather-grid.js'
import { baseDateTime } from '../server/weather.js'
import { getPlaceWeather } from '../server/place-weather.js'
import pins from '../src/data/jejuMapPins.json' with { type: 'json' }
test('LCC reference point and Jeju town grid match known grid coordinates', () => {
  // 기준점(38N,126E)은 제주 검증 범위 바깥이므로 허용하지 않는다.
  assert.deepEqual(toForecastGrid(33.4996,126.5312), { nx:53, ny:38 })
  assert.notDeepEqual(toForecastGrid(33.446621402,126.663992872), toForecastGrid(33.4147546599,126.8948368625))
  assert.throws(() => toForecastGrid(NaN,126), /INVALID_LOCATION/)
})
test('publication cutoff and Korean date rollover are deterministic', () => {
  assert.deepEqual(baseDateTime(Date.parse('2026-11-01T17:14:00Z')), {base_date:'20261101',base_time:'2300'})
  assert.deepEqual(baseDateTime(Date.parse('2026-11-01T17:15:00Z')), {base_date:'20261102',base_time:'0200'})
  assert.deepEqual(baseDateTime(Date.parse('2026-11-02T15:10:00Z')), {base_date:'20261102',base_time:'2300'})
})
test('each selected place sends its own grid and returns forecast issue metadata', async () => {
  const previous = process.env.DATA_GO_KR_KEY; process.env.DATA_GO_KR_KEY = 'test-only'
  try {
    for(const mythId of ['seolmundae','honinji']) {
      const pin = pins.find(p=>p.mythId===mythId), grid=toForecastGrid(pin.realGeoCoords.lat,pin.realGeoCoords.lng)
      const result=await getPlaceWeather(mythId,{ now:Date.parse('2026-11-02T04:30:00Z'),fetchImpl:async url=>{
        const p=new URL(url).searchParams
        assert.equal(p.get('nx'),String(grid.nx)); assert.equal(p.get('ny'),String(grid.ny))
        assert.equal(p.get('base_date'),'20261102'); assert.equal(p.get('base_time'),'1100')
        return Response.json({response:{header:{resultCode:'00'},body:{items:{item:[{fcstDate:'20261102',fcstTime:'1400',category:'TMP',fcstValue:'18'}]}}}})
      }})
      assert.equal(result.mythId,mythId); assert.deepEqual(result.grid,grid)
      assert.equal(result.kind,'forecast'); assert.equal(result.baseTime,'1100')
      assert.equal(result.location.latitude,pin.realGeoCoords.lat); assert.equal(result.items[0].temp,18)
    }
  } finally { if(previous===undefined)delete process.env.DATA_GO_KR_KEY;else process.env.DATA_GO_KR_KEY=previous }
})
test('global or unknown myths make no weather request', async () => {
  for(const id of ['jacheongbi','unknown']) await assert.rejects(getPlaceWeather(id,{fetchImpl:()=>{throw new Error('network must not run')}}),/LOCATION_UNAVAILABLE/)
})
