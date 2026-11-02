import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeForecast } from '../server/weather.js'

function item(date,time,value) {return {fcstDate:date,fcstTime:time,category:'TMP',fcstValue:String(value)}}
test('weather excludes past hours, sorts slots and includes the current KST hour',()=>{
  const now=Date.parse('2026-11-02T02:03:00Z') // 11:03 KST
  const result=normalizeForecast([
    item('20261102','1300',20),item('20261102','0900',17),
    item('20261102','1200',19),item('20261102','1100',18),
  ],'제주시',now)
  assert.deepEqual(result.map(p=>p.time),['20261102 1100','20261102 1200','20261102 1300'])
  assert.equal(result[0].temp,18)
})
test('weather handles Korean midnight and caps returned forecasts at six',()=>{
  const now=Date.parse('2026-11-02T15:03:00Z') // 11/03 00:03 KST
  const entries=[item('20261102','2300',10),...Array.from({length:9},(_,i)=>item('20261103',String(i).padStart(2,'0')+'00',11+i))]
  const result=normalizeForecast(entries,'서귀포시',now)
  assert.equal(result.length,6);assert.equal(result[0].time,'20261103 0000')
  assert.equal(result[5].time,'20261103 0500')
})
test('weather with only past slots returns no stale fallback',()=>{
  assert.deepEqual(normalizeForecast([item('20261102','0900',17)],'제주시',Date.parse('2026-11-02T02:03:00Z')),[])
})
