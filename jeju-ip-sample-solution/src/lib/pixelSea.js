// 배경 아래쪽 바다·섬·돛단배 도트 스프라이트 — 코드로 직접 그린 자체 제작 그림. 같은 seed 면 항상 같은 그림.
export const SEA_TILE = { w: 80, h: 40 } // 가로로 이어 붙이는 타일(경계가 매끄럽다)

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
const pen = (ctx) => (x, y, c, w = 1, h = 1) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h) }

export function drawSeaTile(canvas) {
  const p = pen(canvas.getContext('2d')); const rand = rng(31)
  const bands = [[1, '#52c0d8'], [7, '#46b8d4'], [15, '#3aa9c9'], [25, '#2f9abd'], [33, '#2a8cb0']]
  p(0, 0, '#d9f4fb', SEA_TILE.w, 1) // 수평선의 거품선
  bands.forEach(([y0, c], i) => p(0, y0, c, SEA_TILE.w, (bands[i + 1]?.[0] ?? SEA_TILE.h) - y0))
  for (let n = 0; n < 14; n++) p(rand() * 74, 3 + rand() * 34, rand() > 0.4 ? '#c9f0fa' : '#ffffff', 2 + Math.floor(rand() * 3), 1)
}

export function drawWaveTile(canvas) { // 흐르는 물결 마루
  const p = pen(canvas.getContext('2d')); const rand = rng(77)
  for (let n = 0; n < 9; n++) {
    const x = rand() * 70, y = 4 + rand() * 32, w = 4 + Math.floor(rand() * 4)
    p(x, y, '#e6fafd', w, 1); p(x + 1, y - 1, '#ffffff', Math.max(2, w - 2), 1)
  }
}

export function drawIsland(canvas, { cx, hw, H, seed, crater = true }) {
  const p = pen(canvas.getContext('2d')); const rand = rng(seed)
  const base = canvas.height - 6
  for (let x = 0; x < canvas.width; x++) {
    const d = Math.abs(x - cx) / hw
    if (d >= 1) continue
    let h = H * Math.pow(1 - Math.pow(d, 1.5), 1.1); if (crater && h > H - 2.5) h = H - 2.5
    const top = Math.round(base - h)
    for (let y = top; y < base; y++) { const depth = y - top; p(x, y, depth < 2 ? '#8bd36b' : depth < 9 ? '#4a9a52' : '#2F5D50') }
    if (d > 0.72) p(x, base - 2, '#4a4f55', 1, 2) // 현무암 해안
    p(x, base, '#e8d9a8') // 모래
  }
  if (crater) p(cx - 4, base - H + 1, '#4FA3B7', 8, 2) // 분화구 호수
  for (let n = 0; n < Math.round(hw / 2); n++) { // 숲 점묘와 감귤
    const x = cx + (rand() - 0.5) * hw * 1.4, y = base - 2 - rand() * (H - 4)
    p(x, y, rand() > 0.8 ? '#F28C28' : '#2d7a3e', 1, 1)
  }
  for (let x = 2; x < canvas.width - 2; x += 5 + Math.floor(rand() * 3)) { p(x, base + 2, '#ffffff', 3, 1); p(x + 1, base + 3, '#d9f4fb', 2, 1) } // 파도 거품
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
export const waveTileUrl = () => tileUrl(drawWaveTile)
