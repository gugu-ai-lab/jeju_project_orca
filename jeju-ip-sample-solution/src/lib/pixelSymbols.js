// 이야기별 상징 도트 아이콘(24×24) — 코드로 직접 그린 자체 제작 그림. 같은 id 면 항상 같은 그림.
// 목록 카드 썸네일용: 가로로 긴 삽화를 정사각으로 자르면 안 보이므로, 이야기의 상징만 크게 보여 준다.
const N = 24
const pen = (ctx) => (x, y, c, w = 1, h = 1) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h) }
const disc = (p, cx, cy, r, c) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + 1) p(cx + x, cy + y, c) }
const dome = (p, { cx, base, h, half, pow = 1.6, shades }) => { // 가운데가 솟은 산(오름) 윤곽
  for (let x = cx - half; x <= cx + half; x++) {
    const d = Math.abs(x - cx) / half; if (d > 1) continue
    const top = Math.round(base - h * (1 - Math.pow(d, pow)))
    for (let y = top; y < base; y++) p(x, y, y - top < 2 ? shades[0] : y - top < 7 ? shades[1] : shades[2])
  }
}
const sparkle = (p, x, y, c = '#ffe27a') => { p(x, y - 1, c); p(x - 1, y, c, 3, 1); p(x, y + 1, c) }

const SYMBOLS = {
  // 설문대할망: 한라산과 오름, 치마폭에서 흘러내리는 흙
  seolmundae: { bg: '#cfe9f6', draw: (p) => {
    p(0, 20, '#69b84a', N, 4); p(0, 22, '#4f9c3c', N, 2)
    dome(p, { cx: 5, base: 20, h: 5, half: 6, shades: ['#8bd36b', '#5fb258', '#4a9a52'] }); dome(p, { cx: 19, base: 20, h: 6, half: 7, shades: ['#8bd36b', '#5fb258', '#4a9a52'] })
    dome(p, { cx: 12, base: 20, h: 13, half: 11, shades: ['#9ee07a', '#4a9a52', '#2F5D50'] }); p(10, 8, '#4FA3B7', 4, 2) // 백록담
    for (let i = 0; i < 6; i++) p(15 + i, i * 0.6, '#8fd0e8', 8 - i, 1) // 치마폭(옷자락)
    p(15, 0, '#4a9a52', 1, 1); p(17, 5, '#8a5a2e', 2, 1); p(19, 7, '#8a5a2e'); p(16, 8, '#8a5a2e'); p(20, 10, '#8a5a2e', 1, 2); p(18, 3, '#a9763f') } },
  // 삼성혈: 땅에 난 세 개의 구멍에서 빛이 솟는다
  samsinin: { bg: '#e1f0d2', draw: (p) => {
    p(0, 12, '#69b84a', N, 2); p(0, 14, '#8a5a2e', N, 10); p(0, 14, '#a9763f', N, 1)
    ;[[12, 16, 4, 2], [5, 20, 3, 2], [19, 20, 3, 2]].forEach(([cx, cy, rx, ry]) => {
      for (let y = -ry - 1; y <= ry + 1; y++) for (let x = -rx - 1; x <= rx + 1; x++) { const v = (x * x) / ((rx + 1) ** 2) + (y * y) / ((ry + 1) ** 2); if (v <= 1) p(cx + x, cy + y, v > 0.62 ? '#c9a26a' : '#2b1a0a') }
      p(cx - 1, cy - 1, '#ffe27a', 2, 1) })
    sparkle(p, 12, 6); sparkle(p, 5, 10, '#fff'); sparkle(p, 19, 10, '#fff') } },
  // 혼인지: 연못 위에 떠 있는 나무 상자
  honinji: { bg: '#fbe6cf', draw: (p) => {
    p(0, 15, '#3aa9c9', N, 9); p(0, 15, '#52c0d8', N, 2); for (let x = 2; x < N; x += 6) { p(x, 19, '#8fdcec', 3, 1); p(x + 2, 22, '#8fdcec', 3, 1) }
    p(5, 10, '#8a5a2e', 14, 8); for (let x = 7; x < 19; x += 3) p(x, 10, '#6b4423', 1, 8) // 판자
    p(5, 8, '#a9763f', 14, 3); p(6, 7, '#a9763f', 12, 1); p(5, 13, '#d9a441', 14, 1); p(5, 16, '#d9a441', 14, 1); p(11, 12, '#ffd23f', 3, 3); p(12, 13, '#7a4b2a')
    p(6, 18, '#2a8cb0', 12, 1); sparkle(p, 12, 3); sparkle(p, 4, 6, '#fff') } },
  // 수월봉과 녹고물: 절벽과 샘물이 된 눈물방울
  suwolbong: { bg: '#d8e6f6', draw: (p) => {
    p(0, 19, '#3aa9c9', N, 5); p(0, 19, '#52c0d8', N, 1); p(3, 22, '#8fdcec', 4, 1); p(14, 21, '#8fdcec', 4, 1)
    const strata = ['#a8957a', '#8a7a64', '#6b5c47', '#8a7a64']
    for (let y = 4; y < 19; y++) { const w = 6 + Math.floor((y - 4) / 5) * 2; p(0, y, strata[Math.floor((y - 4) / 2) % 4], w, 1) }
    p(0, 3, '#4a9a52', 6, 2) // 절벽 위 풀
    // 눈물방울: 뾰족한 꼭대기에서 둥근 아랫배로 매끄럽게 넓어지는 모양(행별 폭)
    ;[1, 1, 2, 3, 4, 6, 7, 8, 8, 8, 8, 7, 6, 4].forEach((w, i) => p(16 - Math.floor(w / 2), 4 + i, '#4FA3B7', w, 1))
    p(13, 12, '#d9f4fb', 2, 2); p(13, 14, '#8fdcec'); p(18, 15, '#2a8cb0', 2, 2); sparkle(p, 21, 7, '#fff') } },
  // 산방덕이: 산방산과 굴, 떨어지는 물방울
  sanbangdeok: { bg: '#e6e0f3', draw: (p) => {
    p(0, 20, '#69b84a', N, 4)
    dome(p, { cx: 12, base: 20, h: 16, half: 11, pow: 1.9, shades: ['#8bd36b', '#8a8780', '#6e6c68'] }); for (let x = 7; x < 12; x++) p(x, 9 + (x - 7) / 2, '#b9b6ad') // 암벽 하이라이트
    p(10, 15, '#1a1a1a', 5, 5); p(11, 14, '#1a1a1a', 3, 1); p(12, 20, '#4FA3B7', 1, 1); p(12, 21, '#4FA3B7', 2, 2); p(12, 21, '#d9f4fb'); p(17, 22, '#4FA3B7', 2, 2); p(5, 22, '#4FA3B7', 2, 1) } },
  // 영등할망: 바람과 구름, 미역과 소라
  yeongdeung: { bg: '#d3f0f0', draw: (p) => {
    disc(p, 6, 5, 3, '#fff'); disc(p, 11, 4, 4, '#fff'); disc(p, 16, 6, 3, '#fff'); p(3, 6, '#d6ebfb', 16, 2) // 구름
    ;[[2, 11], [5, 14]].forEach(([x, y]) => { for (let i = 0; i < 16; i++) p(x + i, y + Math.round(Math.sin(i / 2.2) * 1.4), '#7fd3e6') ; p(x + 16, y + 1, '#7fd3e6', 2, 1) }) // 바람
    p(19, 12, '#f6a1c0', 2, 2); p(15, 17, '#f6a1c0', 2, 1) // 날리는 꽃잎
    p(0, 19, '#3aa9c9', N, 5)
    ;[3, 7, 11, 15].forEach((x, i) => { for (let y = 0; y < 8 - i % 2 * 2; y++) p(x + Math.round(Math.sin(y / 1.8 + i) * 1), 23 - y, y % 3 ? '#2d7a3e' : '#4aa357', 2, 1) }) // 미역
    p(19, 20, '#F28C28', 4, 3); p(20, 19, '#ffd9a0', 2, 1); p(21, 21, '#c9650f') } },
  // 자청비: 하늘나라에서 가져온 곡식 이삭
  jacheongbi: { bg: '#fbf0c8', draw: (p) => {
    p(0, 21, '#8a5a2e', N, 3); p(0, 21, '#a9763f', N, 1)
    ;[[6, 15], [12, 18], [18, 14]].forEach(([x, h], i) => {
      for (let y = 21 - h; y < 21; y++) p(x + Math.round(Math.sin(y / 4 + i) * 0.8), y, '#4aa357')
      for (let k = 0; k < 5; k++) { const y = 21 - h - 1 + k * 2; p(x - 2 + (k % 2), y, '#e9b93b', 2, 2); p(x + 1 - (k % 2), y, '#e9b93b', 2, 2); p(x - 2 + (k % 2), y, '#ffe27a', 1, 1) }
      p(x - 1, 21 - h - 3, '#e9b93b', 2, 2)
      p(x + 1, 17, '#4aa357', 3, 1); p(x + 3, 16, '#4aa357', 2, 1); p(x - 4, 15, '#4aa357', 3, 1) // 잎
    }); sparkle(p, 21, 5); sparkle(p, 3, 7, '#fff') } },
}

// 상점 상품용 추가 아이콘: 돌하르방, 감귤
const DOL = ['....KKKKKK....', '...KFFFFFFK...', '..KFFFFFFFFK..', '.KFFFFFFFFFFK.', '.KKKKKKKKKKKK.', '..KFFFFFFFFK..', '..KFBFFFFBFK..', '..KFFFFFFFFK..', '..KFFFKKFFFK..', '..KFFFKKFFFK..', '..KFFFFFFFFK..', '...KFFBBFFK...', '...KFFFFFFK...', '..KFFFFFFFFK..', '.KFFFFFFFFFFK.', '.KFFKFFFFKFFK.', '.KFFFFFFFFFFK.', '..KFFFFFFFFK..', '..KFFFFFFFFK..', '..KKKKKKKKKK..']
SYMBOLS.dolhareubang = { bg: '#e9e4d8', draw: (p) => {
  p(0, 22, '#69b84a', N, 2)
  DOL.forEach((row, j) => [...row].forEach((c, i) => { if (c === '.') return; const l = row[i - 1], r = row[i + 1]
    p(5 + i, 1 + j, c === 'K' || c === 'B' ? '#2b2b2b' : l === 'K' ? '#b9b6ad' : r === 'K' ? '#77746e' : '#9c9993') }))
  sparkle(p, 3, 5, '#fff'); sparkle(p, 21, 9, '#fff') } }
SYMBOLS.tangerine = { bg: '#fdebd0', draw: (p) => {
  p(0, 21, '#8a5a2e', N, 3); p(0, 21, '#a9763f', N, 1)
  disc(p, 12, 14, 7, '#F28C28'); disc(p, 12, 15, 6, '#F28C28'); p(7, 18, '#c9650f', 10, 2); p(9, 20, '#c9650f', 6, 1) // 아랫쪽 음영
  p(8, 10, '#ffb04a', 3, 2); p(9, 9, '#ffd9a0', 2, 1) // 윤기
  p(11, 6, '#6b4423', 2, 2); p(13, 5, '#2d7a3e', 5, 2); p(14, 4, '#4aa357', 3, 1); p(8, 6, '#2d7a3e', 3, 1) // 꼭지와 잎
  sparkle(p, 20, 6); sparkle(p, 4, 9, '#fff') } }

const cache = new Map()
// id 에 해당하는 상징이 있으면 { url, bg } 를, 없으면 null 을 돌려준다(호출하는 쪽이 기존 썸네일로 대체).
export function storySymbol(id) {
  const def = SYMBOLS[id]; if (!def) return null
  if (cache.has(id)) return cache.get(id)
  const c = document.createElement('canvas'); c.width = N; c.height = N
  def.draw(pen(c.getContext('2d')))
  const out = { url: `url(${c.toDataURL()})`, bg: def.bg }; cache.set(id, out); return out
}
export const STORY_SYMBOL_IDS = Object.keys(SYMBOLS)
