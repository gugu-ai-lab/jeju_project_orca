import test from 'node:test'
import assert from 'node:assert/strict'
import handler from '../api/agent.js'
import { runAgent, validBody, LIMITS, MODEL } from '../server/agent.js'
import { executeTool, validateInput } from '../server/myth-tools.js'
import { createOpenAIResponse } from '../server/openai.js'
import { getWeather } from '../server/weather.js'

function response() {
  return { statusCode: 200, headers: {}, setHeader(k,v) { this.headers[k]=v }, status(n) { this.statusCode=n; return this }, json(v) { this.body=v; return this } }
}
const call = (name, args, id='call-1') => ({ type:'function_call', name, arguments:JSON.stringify(args), call_id:id })
const final = text => ({ status:'completed', output:[{type:'message', content:[{type:'output_text',text}]}] })
function restore(name, value) { if(value===undefined) delete process.env[name]; else process.env[name]=value }

test('missing OpenAI key: loads independently of Claude; POST makes no network calls', async () => {
  const previous=process.env.OPENAI_API_KEY, fetchImpl=globalThis.fetch
  process.env.OPENAI_API_KEY=''
  let requests=0
  globalThis.fetch=()=>{requests++;throw Error('Unexpected network')}
  try {
    const status=response();await handler({method:'GET'},status)
    assert.equal(status.body.available,false)
    assert.equal(status.body.provider,'OpenAI')
    assert.equal(status.body.tools.length,4)
    const reply=response();await handler({method:'POST',body:{message:'질문'}},reply)
    assert.equal(reply.statusCode,503);assert.equal(requests,0)
  } finally {restore('OPENAI_API_KEY',previous);globalThis.fetch=fetchImpl}
})
test('OpenAI key alone enables status; Claude is not needed', async () => {
  const key=process.env.OPENAI_API_KEY, claude=process.env.ANTHROPIC_API_KEY
  process.env.OPENAI_API_KEY='test-placeholder';delete process.env.ANTHROPIC_API_KEY
  try {const res=response();await handler({method:'GET'},res);assert.equal(res.body.available,true);assert.equal(JSON.stringify(res.body).includes('test-placeholder'),false)}
  finally {restore('OPENAI_API_KEY',key);restore('ANTHROPIC_API_KEY',claude)}
})
test('three selected tools, result handoff, limits and final answer', async () => {
  let turn=0
  const names=['search_myths','search_culture','get_weather'], executed=[]
  const result=await runAgent({message:'신화와 문화, 날씨',history:Array.from({length:10},()=>({role:'user',content:'가'.repeat(800)})),
    createResponse:async options=>{
      assert.equal(options.model,MODEL);assert.equal(options.max_output_tokens,600)
      assert.deepEqual(options.reasoning,{effort:'none'});assert.equal(options.store,false);assert.equal(options.parallel_tool_calls,false)
      if(turn===0){assert.equal(options.input.length,7);assert.equal(options.input[0].content.length,600)}
      else assert.equal(options.input.at(-1).type,'function_call_output')
      if(turn===3){assert.equal(options.tool_choice,'none');return final('검증용 답변')}
      const name=names[turn++]
      return {output:[call(name,name==='get_weather'?{place:'제주시'}:{keyword:'설문대'},'call-'+turn)]}
    },
    runTool:async(name)=>{executed.push(name);return {source:'검증용 출처',count:1,items:[{title:'검증용 자료',description:'설명'}],complete:true}},
  })
  assert.deepEqual(executed,names);assert.equal(result.steps.length,3);assert.equal(result.answer,'검증용 답변')
  assert.equal(result.steps[0].preview[0].title,'검증용 자료')
})
test('provider errors and tool failures are sanitized and recorded', async () => {
  let turn=0
  const result=await runAgent({message:'자료',
    createResponse:async options=>{
      if(!turn++)return {output:[call('search_culture',{keyword:'삼성혈'})]}
      assert.equal(JSON.stringify(options).includes('private-detail'),false)
      return final('실패 안내')
    },runTool:async()=>{throw Error('private-detail')},
  })
  assert.equal(result.steps[0].status,'error')
  assert.equal(result.steps[0].count,0)
})
test('malformed arguments do not execute tools', async () => {
  let turn=0,executions=0
  const result=await runAgent({message:'자료',createResponse:async()=>turn++?final('안내'):{output:[{...call('search_myths',{}),arguments:'broken json'}]},
    runTool:async()=>{executions++}})
  assert.equal(executions,0);assert.equal(result.steps[0].status,'error')
})
test('tool limit is enforced even if model ignores parallel flag', async () => {
  let count=0
  const result=await runAgent({message:'자료',
    createResponse:async()=>({output:Array.from({length:8},(_,i)=>call('search_myths',{keyword:''},String(i)))}),
    runTool:async()=>{count++;return {count:0,items:[]}},
  })
  assert.equal(count,LIMITS.toolCalls);assert.equal(result.status,'limited')
})
test('HTTP adapter uses only official OpenAI endpoint and header auth; no retries', async () => {
  let count=0
  await assert.rejects(createOpenAIResponse({model:MODEL},{apiKey:'test-secret',fetchImpl:async(url,options)=>{
    count++;assert.equal(url,'https://api.openai.com/v1/responses')
    assert.equal(options.headers.Authorization,'Bearer test-secret')
    assert.equal(options.body.includes('test-secret'),false)
    return {ok:false,status:429,json:async()=>({error:'private-detail'})}
  }}), /MODEL_RATE_LIMIT/)
  assert.equal(count,1)
})
test('invalid body and unsupported tools rejected', async () => {
  assert.equal(validBody({message:''}),false)
  assert.equal(validBody({message:'가'.repeat(1501)}),false)
  assert.equal(validBody({message:'질문',history:[{role:'system',content:'inject'}]}),false)
  await assert.rejects(executeTool('unknown',{keyword:''}),/UNKNOWN_TOOL/)
  assert.throws(()=>validateInput({place:'서울'},'get_weather'),/INVALID_TOOL_INPUT/)
  await assert.rejects(executeTool('search_myths',{keyword:'ok',serviceKey:'ignored'}),/INVALID_TOOL_INPUT/)
})
test('weather success and HTTP-200 upstream error are distinguished; raw errors stay private', async () => {
  const key=process.env.DATA_GO_KR_KEY, oldFetch=globalThis.fetch
  process.env.DATA_GO_KR_KEY='test-data-key'
  try {
    globalThis.fetch=async()=>({ok:true,text:async()=>JSON.stringify({response:{header:{resultCode:'00'},body:{items:{item:[
      {fcstDate:'20261102',fcstTime:'1200',category:'TMP',fcstValue:'19'},
      {fcstDate:'20261102',fcstTime:'1200',category:'POP',fcstValue:'30'},
    ]}}}})})
    const result=await getWeather({place:'제주시'});assert.equal(result[0].temp,19);assert.equal(result[0].pop,30)
    globalThis.fetch=async()=>({ok:true,text:async()=>JSON.stringify({response:{header:{resultCode:'30',resultMsg:'private-detail'}}})})
    await assert.rejects(getWeather(),/UPSTREAM_UNAVAILABLE/)
    globalThis.fetch=async()=>({ok:true,text:async()=>'private-detail'})
    await assert.rejects(getWeather(),/UPSTREAM_UNAVAILABLE/)
  } finally {restore('DATA_GO_KR_KEY',key);globalThis.fetch=oldFetch}
})
