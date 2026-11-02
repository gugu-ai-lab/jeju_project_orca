// 배경 아래쪽 바다·섬·돛단배 도트 스프라이트 — 코드로 직접 그린 자체 제작 그림. 같은 seed 면 항상 같은 그림.
export const SEA_TILE = { w: 80, h: 40 } // 가로로 이어 붙이는 타일(경계가 매끄럽다)

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
const pen = (ctx) => (x, y, c, w = 1, h = 1) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h) }

const TAU = Math.PI * 2
// 물결선의 한 주기(40px)가 타일 폭(80px)을 나누어 떨어지므로 좌우로 이어 붙여도 끊기지 않는다.
const swell = (x, phase, amp) => Math.round(amp * Math.sin(TAU * (x / 40) + phase))

export function drawSeaTile(canvas) {
  const p = pen(canvas.getContext('2d')); const rand = rng(31)
  const bands = [[1, '#52c0d8'], [8, '#46b8d4'], [16, '#3aa9c9'], [25, '#2f9abd'], [33, '#2a8cb0']]
  const H = SEA_TILE.h, W = SEA_TILE.w
  // 색 띠: 경계가 물결 모양이라 아래 물결선이 움직일 때 자연스럽게 이어진다
  for (let x = 0; x < W; x++) {
    bands.forEach(([y0, c], i) => { const top = y0 + (i ? swell(x, i * 1.3, 1) : 0); const bot = (bands[i + 1] ? bands[i + 1][0] + swell(x, (i + 1) * 1.3, 1) : H); p(x, top, c, 1, bot - top) })
    p(x, 0, '#d9f4fb') // 수평선의 거품선
  }
  for (let n = 0; n < 12; n++) p(rand() * 76, 4 + rand() * 32, '#8fdcec', 1 + Math.floor(rand() * 2), 1) // 은은한 반짝임
}

// variant 0/1: 서로 다른 높이·위상의 물결선(사인 곡선). 흰 덩어리가 아니라 가느다란 물결 마루선.
export function drawWaveTile(canvas, variant = 0) {
  const p = pen(canvas.getContext('2d'))
  const rows = variant ? [21, 32] : [6, 14] // variant 1 은 섬 밑동(21행)과 그 아래만 지나가, 몸통을 가로지르지 않고 섬이 물에 잠긴 느낌만 준다
  rows.forEach((row, k) => {
    for (let x = 0; x < SEA_TILE.w; x++) {
      const y = row + swell(x, variant * 2 + k * 1.7, 1.6)
      const crest = Math.sin(TAU * (x / 40) + variant * 2 + k * 1.7) > 0.8
      p(x, y, crest ? '#d9f4fb' : '#7fd3e6') // 마루는 밝게, 나머지는 바다보다 한 톤 밝은 하늘색
      if (crest) p(x, y + 1, '#52c0d8')
    }
  })
}

export function drawIsland(canvas, { cx, hw, H, seed, crater = true }) {
  const p = pen(canvas.getContext('2d')); const rand = rng(seed)
  const base = canvas.height - 6
  for (let x = 0; x < canvas.width; x++) {
    const d = Math.abs(x - cx) / hw
    if (d >= 1) continue
    let h = H * Math.pow(1 - Math.pow(d, 1.5), 1.1); if (crater && h > H - 2.5) h = H - 2.5
    const top = Math.round(base - h)
    if (top >= base) continue // 가장자리 한두 칸은 그리지 않아 모서리가 튀어나오지 않게 한다
    for (let y = top; y < base; y++) { const depth = y - top; p(x, y, depth < 2 ? '#8bd36b' : depth < 9 ? '#4a9a52' : '#2F5D50') }
    if (base - top >= 4 && rand() > 0.55) p(x, base - 1, '#4a4f55', 1, rand() > 0.7 ? 2 : 1) // 현무암 해안: 듬성듬성 박힌 바위
    p(x, base, '#e8d9a8') // 모래
    p(x, base + 1, 'rgba(15,46,42,.35)') // 물에 비친 그림자(잠긴 느낌)
  }
  if (crater) p(cx - 4, Math.round(base - (H - 2.5)), '#4FA3B7', 8, 2) // 분화구 호수: 평평한 정상 표면에 붙인다
  for (let n = 0; n < Math.round(hw / 2); n++) { // 숲 점묘와 감귤
    const x = cx + (rand() - 0.5) * hw * 1.4, y = base - 2 - rand() * (H - 4)
    p(x, y, rand() > 0.8 ? '#F28C28' : '#2d7a3e', 1, 1)
  }
}

const BOAT = [
  '.......m......', '......mww.....', '.....mwwww....', '....mwwwwww...', '...mwwwwwws...',
  '.......m......', '.hhhhhhhhhhhh.', '..hhhhhhhhhh..',
]
export function drawBoat(canvas) {
  const p = pen(canvas.getContext('2d'))
  const col = { m: '#6b4423', w: '#ffffff', s: '#d6ebfb', h: '#7a4b2a' }
  BOAT.forEach((row, y) => [...row].forEach((c, x) => { if (col[c]) p(x, y, col[c]) }))
}

const tileUrl = (draw) => { const c = document.createElement('canvas'); c.width = SEA_TILE.w; c.height = SEA_TILE.h; draw(c); return `url(${c.toDataURL()})` }
export const seaTileUrl = () => tileUrl(drawSeaTile)
export const waveTileUrl = (variant = 0) => tileUrl((c) => drawWaveTile(c, variant))

// ── 바닷속: 물고기·해녀·테왁·바다 밑바닥 스프라이트 (모두 코드로 그림) ──
// rows: 문자 지도, pal: 문자→색, frames: 같은 크기의 프레임 여러 장을 가로로 이어 붙인 스프라이트 시트를 만든다.
function sheet(frames, pal) {
  const fh = frames[0].length, fw = Math.max(...frames.flat().map((r) => r.length))
  const c = document.createElement('canvas'); c.width = fw * frames.length; c.height = fh
  const ctx = c.getContext('2d')
  frames.forEach((rows, f) => rows.forEach((row, y) => [...row].forEach((ch, x) => { if (pal[ch]) { ctx.fillStyle = pal[ch]; ctx.fillRect(f * fw + x, y, 1, 1) } })))
  return { url: `url(${c.toDataURL()})`, fw, fh, n: frames.length }
}

const FISH = [
  ['....xxxx....', '.x.xxxxxxx..', 'xxxxxxxxxe..', 'xbbbbbbbbbb.', '.b.bbbbbbb..', '....bbbb....'],
  ['....xxxx....', 'xx.xxxxxxx..', '.xxxxxxxxe..', '.bbbbbbbbbb.', 'bb.bbbbbbb..', '....bbbb....'],
]
export const FISH_KINDS = {
  orange: { x: '#F28C28', b: '#ffd9a0', e: '#1d2a3a' }, // 감귤빛 물고기
  yellow: { x: '#ffd23f', b: '#fff0a8', e: '#1d2a3a' }, // 자리돔
  blue: { x: '#7fd3e6', b: '#d9f4fb', e: '#1d2a3a' },   // 작은 푸른 물고기
}
export const fishSheet = (kind) => sheet(FISH, FISH_KINDS[kind])

// 해녀: 검은 잠수복, 물안경, 주황 오리발, 주황 망사리를 매단 채 헤엄치는 옆모습(발차기 2프레임)
const HAENYEO_PAL = { k: '#1a1a1a', f: '#f1c9a5', L: '#a9d7f3', s: '#22313f', S: '#3a566c', o: '#F28C28', r: '#e9a23b', n: '#7a4b2a' }
const H_A = ['................kkkk..', '...............kkkkkk.', '...............kLLffk.', '.......ssssssssSsffff..', '..ooo.ssssssssssss.....', '.ooo..sssssssssss......', 'ooo...........rrrr.....', '..............rnrnr....', '..............rrrr.....']
const H_B = ['................kkkk..', '...............kkkkkk.', 'ooo............kLLffk.', '.ooo....ssssssSsffff...', '......ssssssssssss.....', '......sssssssssss......', '..............rrrr.....', '..............rnrnr....', '..............rrrr.....']
export const haenyeoSheet = () => sheet([H_A.map((r) => r.padEnd(22, '.')), H_B.map((r) => r.padEnd(22, '.'))], HAENYEO_PAL)

// 테왁: 해녀가 수면에 띄우는 주황 부표(윗부분만 물 위로 보이고, 아래로 망이 늘어짐)
const TEWAK = ['...oooooo...', '..oOOOOOOo..', '.oOwOOOOOOo.', '.oOOOOOOOOo.', '..oooooooo..', '....n..n....', '....n..n....', '...nn..nn...']
export const tewakSheet = () => sheet([TEWAK], { o: '#c9650f', O: '#F28C28', w: '#ffd9a0', n: '#7a4b2a' })

export const SEABED_TILE = { w: 80, h: 28 }
export function drawSeabed(canvas) { // 모래 + 현무암 + 감귤색 소라
  const ctx = canvas.getContext('2d'); const p = pen(ctx); const rand = rng(63)
  for (let x = 0; x < 80; x++) { const top = 13 + Math.round(1.2 * Math.sin((x / 40) * Math.PI * 2)); p(x, top, '#efe0b0'); p(x, top + 1, '#d9c58f', 1, 28 - top - 1) }
  for (let n = 0; n < 40; n++) p(rand() * 78, 16 + rand() * 11, rand() > 0.5 ? '#c4ad76' : '#efe0b0', 1, 1)
  const rock = (x, y, w, h) => { p(x, y, '#3b3f44', w, h); p(x + 1, y, '#6a7076', w - 3, 1); p(x, y + h - 1, '#24272b', w, 1) }
  rock(8, 7, 14, 9); rock(14, 4, 8, 5); rock(50, 9, 12, 7)
  p(34, 18, '#F28C28', 3, 2); p(36, 17, '#ffd9a0', 1, 1); p(66, 20, '#F28C28', 3, 2) // 소라
}
export function drawSeaweed(canvas) { // 흔들리는 해초(다른 레이어로 흔들어 준다)
  const p = pen(canvas.getContext('2d'))
  ;[[24, 15], [31, 11], [58, 14], [70, 10]].forEach(([x, h]) => { for (let y = 0; y < h; y++) { const dx = Math.round(Math.sin(y / 3 + x) * 1.2); p(x + dx, 27 - 14 - y + 14, y % 4 < 2 ? '#2d7a3e' : '#4aa357', 2, 1) } })
}
const tileUrl2 = (draw, w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c); return `url(${c.toDataURL()})` }
export const seabedUrl = () => tileUrl2(drawSeabed, SEABED_TILE.w, SEABED_TILE.h)
export const seaweedUrl = () => tileUrl2(drawSeaweed, SEABED_TILE.w, SEABED_TILE.h)
