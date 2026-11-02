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
