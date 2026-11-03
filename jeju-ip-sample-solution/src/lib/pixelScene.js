// 제주 픽셀 장면을 320x180 캔버스에 코드로 그린다. 외부 이미지·참고 이미지를 쓰지 않는 자체 제작 그림.
// 같은 seed 면 항상 같은 그림이 나온다.
export const SCENE_W = 320
export const SCENE_H = 180
const HORIZON = 104

function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pen = (ctx) => (x, y, c, w = 1, h = 1) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h) }

function sky(p, rand) {
  const bands = ['#3f9be8', '#4aa6ee', '#58b1f1', '#68bcf4', '#7cc8f6', '#92d3f8', '#a9ddfa', '#c4e9fc']
  const bh = HORIZON / bands.length
  for (let y = 0; y < HORIZON; y++) {
    const i = Math.min(bands.length - 1, Math.floor(y / bh))
    const edge = y - i * bh
    for (let x = 0; x < SCENE_W; x++) {
      // 밴드 경계에서 체크무늬 디더링
      const next = bands[Math.min(bands.length - 1, i + 1)]
      const dither = edge > bh - 2 && (x + y) % 2 === 0
      p(x, y, dither ? next : bands[i])
    }
  }
  for (let n = 0; n < 26; n++) p(rand() * SCENE_W, rand() * 40, '#ffffff', 1, 1) // 반짝이는 빛
}

function mountain(p, { cx, base, height, half, shades, crown }) {
  for (let x = 0; x < SCENE_W; x++) {
    const d = Math.abs(x - cx) / half
    if (d >= 1) continue
    let h = height * Math.pow(1 - Math.pow(d, 1.6), 1.15)
    if (crown && h > height - crown) h = height - crown
    const top = Math.round(base - h)
    for (let y = top; y < base; y++) {
      const depth = y - top
      p(x, y, depth < 2 ? shades[0] : depth < 14 ? shades[1] : depth < 28 ? shades[2] : shades[3])
    }
  }
}

function hallasan(p, rand) {
  const cx = 165
  mountain(p, { cx: 70, base: HORIZON + 6, height: 24, half: 78, shades: ['#8bd36b', '#5fb258', '#4a9a52', '#3a7f48'] }) // 오름
  mountain(p, { cx: 262, base: HORIZON + 6, height: 18, half: 62, shades: ['#8bd36b', '#5fb258', '#4a9a52', '#3a7f48'] })
  mountain(p, { cx, base: HORIZON + 6, height: 50, half: 150, crown: 6, shades: ['#9ee07a', '#5aab57', '#3f8f4a', '#2F5D50'] }) // 한라산
  // 백록담: 정상 분화구와 물
  const top = HORIZON + 6 - 44
  p(cx - 15, top, '#2F5D50', 30, 1)
  for (let y = 0; y < 4; y++) {
    const w = 24 - Math.abs(y - 1.5) * 4
    p(cx - w / 2, top + y, y === 0 ? '#9fdcf0' : '#4FA3B7', Math.round(w), 1)
  }
  for (let n = 0; n < 60; n++) { // 능선의 숲 점묘
    const x = cx - 130 + rand() * 260
    const y = top + 8 + rand() * 38
    p(x, y, rand() > 0.5 ? '#2f7a45' : '#4aa357', 2, 1)
  }
}

function sea(p, rand) {
  const rows = ['#52c0d8', '#46b8d4', '#3aa9c9', '#3aa9c9', '#2f9abd', '#2f9abd', '#2a8cb0']
  const y0 = HORIZON + 6, y1 = 130
  for (let y = y0; y < y1; y++) p(0, y, rows[Math.min(rows.length - 1, Math.floor(((y - y0) / (y1 - y0)) * rows.length))], SCENE_W, 1)
  p(0, y0, '#d9f4fb', SCENE_W, 1) // 수평선의 거품선
  for (let n = 0; n < 90; n++) { // 물결 반짝임
    const x = rand() * SCENE_W, y = y0 + 2 + rand() * (y1 - y0 - 4)
    p(x, y, rand() > 0.4 ? '#c9f0fa' : '#ffffff', 2 + Math.floor(rand() * 3), 1)
  }
}

// 랜딩 바다 위를 움직이는 작은 돛단배를 투명 캔버스에 그린다.
export function drawSailboat(canvas) {
  const p = pen(canvas.getContext('2d'))
  p(2, 6, '#69462b', 10, 1); p(3, 7, '#8b5a32', 8, 1)
  p(6, 1, '#69462b', 1, 5)
  p(7, 1, '#fffdf7', 4, 1); p(7, 2, '#fffdf7', 3, 1); p(7, 3, '#fffdf7', 2, 1); p(7, 4, '#fffdf7', 1, 1)
  p(3, 3, '#cfe9f8', 2, 1); p(4, 4, '#cfe9f8', 1, 1)
}

function grass(p, rand) {
  for (let x = 0; x < SCENE_W; x++) {
    const ly = Math.round(126 + 2 * Math.sin(x * 0.07) + (rand() > 0.85 ? 1 : 0))
    for (let y = ly; y < SCENE_H; y++) {
      const r = rand()
      p(x, y, r > 0.93 ? '#8ad65a' : r > 0.78 ? '#5aa63f' : '#69b84a')
    }
    p(x, ly - 1, '#e8d9a8') // 해안선 모래
  }
}

function canola(p, rand) { // 유채꽃밭
  for (let n = 0; n < 420; n++) {
    const x = rand() * SCENE_W, y = 130 + rand() * 18
    p(x, y + 1, '#3f8f3a', 1, 2)
    p(x - 1, y, '#ffd23f', 3, 1); p(x, y - 1, '#ffe27a', 1, 1)
  }
}

function stoneWall(p, rand) { // 제주 현무암 돌담
  const rowsY = [146, 151]
  rowsY.forEach((y, r) => {
    let x = r ? -5 : 0
    while (x < SCENE_W) {
      const w = 7 + Math.floor(rand() * 5)
      const shade = ['#3b3f44', '#454a50', '#2f3338'][Math.floor(rand() * 3)]
      p(x, y, shade, w - 1, 5)
      p(x + 1, y, '#6a7076', w - 3, 1) // 윗면 하이라이트
      p(x, y + 4, '#24272b', w - 1, 1)
      x += w
    }
  })
  p(0, 156, '#2a2d31', SCENE_W, 1)
}

function path(p, rand) {
  for (let y = 157; y < SCENE_H; y++) for (let x = 0; x < SCENE_W; x++) {
    const stone = (Math.floor(x / 14) + Math.floor((y - 157) / 7) * 5) % 2
    p(x, y, rand() > 0.96 ? '#a89a7a' : stone ? '#cdbf9e' : '#c2b38f')
  }
  for (let y = 164; y < SCENE_H; y += 7) p(0, y, '#a89a7a', SCENE_W, 1)
}

function tangerineTree(p, rand, x, y, r) { // 감귤나무
  p(x - 1, y, '#6b4423', 3, r)
  p(x - 1, y, '#8a5a2e', 1, r)
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (dx * dx + dy * dy <= r * r) p(x + dx, y - r + dy, dy < -r / 3 ? '#3f9a4f' : '#2d7a3e')
  }
  for (let n = 0; n < r; n++) {
    const a = rand() * 6.28, d = rand() * (r - 2)
    const ox = x + Math.cos(a) * d, oy = y - r + Math.sin(a) * d
    p(ox, oy, '#f28c28', 2, 2); p(ox, oy, '#ffb04a', 1, 1)
  }
}

const DOL = [ // 돌하르방 14x20 — K 윤곽 / F 돌 / B 눈·입
  '....KKKKKK....', '...KFFFFFFK...', '..KFFFFFFFFK..', '.KFFFFFFFFFFK.', '.KKKKKKKKKKKK.',
  '..KFFFFFFFFK..', '..KFBFFFFBFK..', '..KFFFFFFFFK..', '..KFFFKKFFFK..', '..KFFFKKFFFK..',
  '..KFFFFFFFFK..', '...KFFBBFFK...', '...KFFFFFFK...', '..KFFFFFFFFK..', '.KFFFFFFFFFFK.',
  '.KFFKFFFFKFFK.', '.KFFFFFFFFFFK.', '..KFFFFFFFFK..', '..KFFFFFFFFK..', '..KKKKKKKKKK..',
]
function dolhareubang(p, x0, y0) {
  DOL.forEach((row, j) => [...row].forEach((c, i) => {
    if (c === '.') return
    if (c === 'K') return p(x0 + i, y0 + j, '#2b2b2b')
    if (c === 'B') return p(x0 + i, y0 + j, '#2b2b2b')
    const l = row[i - 1], r = row[i + 1]
    p(x0 + i, y0 + j, l === 'K' ? '#b9b6ad' : r === 'K' ? '#77746e' : '#9c9993')
  }))
  p(x0 + 2, y0 + 20, '#00000033', 10, 1)
}

export function drawScene(canvas, seed = 20261102) {
  const ctx = canvas.getContext('2d')
  const p = pen(ctx)
  const rand = rng(seed)
  sky(p, rand); hallasan(p, rand); sea(p, rand); grass(p, rand); canola(p, rand)
  stoneWall(p, rand); path(p, rand)
  tangerineTree(p, rand, 42, 163, 9); tangerineTree(p, rand, 110, 169, 9)
  tangerineTree(p, rand, 218, 169, 9); tangerineTree(p, rand, 286, 163, 9)
  dolhareubang(p, 153, 150)
  for (let n = 0; n < 70; n++) { // 앞쪽 유채꽃
    const x = rand() * SCENE_W, y = 166 + rand() * 13
    p(x, y + 1, '#3f8f3a', 1, 2); p(x - 1, y, '#ffd23f', 3, 1); p(x, y - 1, '#ffe27a', 1, 1)
  }
}

// 구름 — 가로로 두 번 반복되는 띠(CSS 로 흘려 보낸다)
export function drawClouds(canvas, seed = 7) {
  const ctx = canvas.getContext('2d')
  const p = pen(ctx)
  const rand = rng(seed)
  const clouds = [[40, 26, 22], [150, 14, 16], [230, 38, 26], [290, 12, 14], [100, 50, 12]]
  const blob = (cx, cy, w, shift) => {
    const puffs = [[-0.55, 0.15, 0.32], [-0.2, -0.1, 0.42], [0.2, 0, 0.38], [0.55, 0.15, 0.3]]
    for (const [ox, oy, rr] of puffs) {
      const r = Math.max(3, Math.round(w * rr))
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r) continue
        const y = cy + oy * w + dy
        p(shift + cx + ox * w + dx, y, y > cy + w * 0.12 ? '#d3e9fa' : '#ffffff')
      }
    }
  }
  for (const [cx, cy, w] of clouds) { blob(cx, cy, w + Math.floor(rand() * 3), 0); blob(cx, cy, w, SCENE_W) }
}
