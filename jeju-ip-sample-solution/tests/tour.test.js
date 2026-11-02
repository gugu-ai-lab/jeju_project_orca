import test from 'node:test'
import assert from 'node:assert/strict'
import { getTourDetail, searchTour, searchTourPage, searchTourPlaces } from '../server/tour.js'
import { executeTool, tools } from '../server/myth-tools.js'
import { runAgent } from '../server/agent.js'

function fixture(t, fetchImpl) {
  const key=process.env.DATA_GO_KR_KEY, original=globalThis.fetch
  process.env.DATA_GO_KR_KEY='test-only-data-key';globalThis.fetch=fetchImpl
  t.after(()=>{globalThis.fetch=original;if(key===undefined)delete process.env.DATA_GO_KR_KEY;else process.env.DATA_GO_KR_KEY=key})
}
const reply=(items=[],code='0000')=>({ok:true,status:200,text:async()=>JSON.stringify({response:{header:{resultCode:code,resultMsg:'OK'},body:{items:{item:items},totalCount:items.length}}})})
const place={contentid:'127744',title:'제주 삼성혈',addr1:'제주특별자치도 제주시 삼성로 22',mapx:'126.5289',mapy:'33.5041',contenttypeid:'12'}
test('Jeju search and detail share one normalized tool; legacy array preserved',async t=>{
  const requested=[]
  fixture(t,async url=>{
    const u=new URL(url);requested.push(u.pathname)
    assert.equal(u.searchParams.get('serviceKey'),'test-only-data-key')
    if(u.pathname.endsWith('searchKeyword2')){
      assert.equal(u.searchParams.get('lDongRegnCd'),'50');assert.equal(u.searchParams.has('areaCode'),false)
      return reply([place])
    }
    assert.equal(u.searchParams.get('contentId'),'127744')
    return reply([{...place,overview:'<p>삼신인과 관련된 장소</p>&nbsp;소개'}])
  })
  const data=await executeTool('search_tour_places',{keyword:'삼성혈'})
  assert.equal(data.count,1);assert.equal(data.items[0].address,place.addr1)
  assert.equal(data.items[0].description,'삼신인과 관련된 장소 소개');assert.equal(data.complete,true)
  const legacy=await searchTour({keyword:'삼성혈'});assert.equal(legacy[0].addr,place.addr1)
  assert.equal(requested.length,3)
  assert.ok(tools.some(t=>t.name==='get_weather'));assert.ok(tools.some(t=>t.name==='search_myths'))
})
test('empty keyword and type search the full Jeju tourism and culture list',async t=>{
  fixture(t,async url=>{
    const u=new URL(url)
    assert.ok(u.pathname.endsWith('/areaBasedList2'))
    assert.equal(u.searchParams.get('lDongRegnCd'),'50')
    assert.equal(u.searchParams.has('keyword'),false)
    assert.equal(u.searchParams.has('contentTypeId'),false)
    return reply([place,{...place,contentid:'200',contenttypeid:'14',title:'제주 문화시설'}])
  })
  const results=await searchTour({keyword:'',contentTypeId:''})
  assert.equal(results.length,2)
  assert.deepEqual(results.map(item=>item.type),['12','14'])
})
test('tour list returns 20-item pages, total count and restaurant category',async t=>{
  fixture(t,async url=>{
    const u=new URL(url)
    assert.ok(u.pathname.endsWith('/searchKeyword2'))
    assert.equal(u.searchParams.get('keyword'),'흑돼지')
    assert.equal(u.searchParams.get('contentTypeId'),'39')
    assert.equal(u.searchParams.get('pageNo'),'2')
    assert.equal(u.searchParams.get('numOfRows'),'20')
    return {ok:true,status:200,text:async()=>JSON.stringify({response:{header:{resultCode:'0000'},body:{items:{item:[{...place,contentid:'39',contenttypeid:'39'}]},totalCount:43}}})}
  })
  const result=await searchTourPage({keyword:'흑돼지',contentTypeId:'39',pageNo:2,rows:20})
  assert.equal(result.items[0].type,'39');assert.equal(result.totalCount,43);assert.equal(result.page,2);assert.equal(result.pageSize,20)
})
test('HTTP 200 with auth error is failure, not an empty successful list',async t=>{
  fixture(t,async()=>reply([],'30'))
  await assert.rejects(searchTour({keyword:'삼성혈'}),error=>error.message==='TOUR_AUTH_ERROR'&&error.upstreamCode==='30'&&error.httpStatus===200)
})
test('XML gateway auth error is recognized without leaking raw body',async t=>{
  fixture(t,async()=>({ok:false,status:403,text:async()=>'<OpenAPI_ServiceResponse><cmmMsgHeader><errMsg>test-only-data-key</errMsg><returnReasonCode>31</returnReasonCode></cmmMsgHeader></OpenAPI_ServiceResponse>'}))
  await assert.rejects(searchTour({keyword:'삼성혈'}),error=>{
    assert.equal(error.message,'TOUR_AUTH_ERROR');assert.equal(error.upstreamCode,'31')
    assert.equal(JSON.stringify(error).includes('test-only-data-key'),false)
    return true
  })
})
test('detail failure retains address and coordinates and is explicitly partial',async t=>{
  fixture(t,async url=>new URL(url).pathname.endsWith('searchKeyword2')?reply([place]):reply([],'30'))
  const result=await searchTourPlaces({keyword:'삼성혈'})
  assert.equal(result.complete,false);assert.equal(result.items[0].detailStatus,'error')
  assert.equal(result.items[0].address,place.addr1);assert.equal(result.items[0].upstreamCode,'30')
})
test('empty results do not make detail calls; max three details',async t=>{
  let requests=0
  fixture(t,async()=>{requests++;return reply([])})
  assert.equal((await searchTourPlaces({keyword:'없는장소'})).count,0);assert.equal(requests,1)
})
test('TourAPI failure does not prevent following weather tool; no paid requests',async()=>{
  let turn=0
  const result=await runAgent({message:'관광지와 날씨',createResponse:async()=>{
    const names=['search_tour_places','get_weather']
    if(turn===2)return {output:[{type:'message',content:[{type:'output_text',text:'실패와 날씨를 안내'}]}]}
    const name=names[turn++];return {output:[{type:'function_call',name,arguments:JSON.stringify(name==='get_weather'?{place:'제주시'}:{keyword:'삼성혈'}),call_id:'c'+turn}]}
  },runTool:async name=>{
    if(name==='search_tour_places'){const e=new Error('TOUR_AUTH_ERROR');e.upstreamCode='30';e.httpStatus=200;throw e}
    return {count:1,source:'기상청 단기예보',items:[{title:'제주시 예보'}],complete:true}
  }})
  assert.deepEqual(result.steps.map(s=>s.status),['error','success']);assert.equal(result.steps[0].upstreamCode,'30')
})

test('TourAPI detailCommon2 returns official description, photo and coordinates for a selected place',async t=>{
  fixture(t,async url=>{
    const u=new URL(url)
    assert.ok(u.pathname.endsWith('/detailCommon2'))
    assert.equal(u.searchParams.get('contentId'),'1544730')
    assert.equal(u.searchParams.get('numOfRows'),'1')
    return reply([{...place,contentid:'1544730',title:'제주돌문화공원',addr1:'제주시 조천읍 남조로 2023',mapx:'126.6639',mapy:'33.4466',firstimage:'https://example.invalid/photo.jpg',overview:'<p>확인된 소개</p>',tel:'064-000-0000'}])
  })
  const detail=await getTourDetail({contentId:'1544730'})
  assert.equal(detail.title,'제주돌문화공원');assert.equal(detail.description,'확인된 소개')
  assert.equal(detail.lat,'33.4466');assert.equal(detail.lng,'126.6639')
  assert.equal(detail.image,'https://example.invalid/photo.jpg');assert.equal(detail.imageSource,'한국관광공사 TourAPI')
})
