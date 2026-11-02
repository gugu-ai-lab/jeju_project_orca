// 상품 전용 도트 그림(32×32) — 이야기 상징이 아니라 "물건" 모양을 코드로 직접 그렸다. 같은 id 면 항상 같은 그림.
const N = 32
const pen = (ctx) => (x, y, c, w = 1, h = 1) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h) }
const disc = (p, cx, cy, r, c) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + 1) p(cx + x, cy + y, c) }
const ellipse = (p, cx, cy, rx, ry, c) => { for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1.02) p(cx + x, cy + y, c) }
const ring = (p, cx, cy, r0, r1, c) => { for (let y = -r1; y <= r1; y++) for (let x = -r1; x <= r1; x++) { const d = Math.hypot(x, y); if (d >= r0 && d <= r1) p(cx + x, cy + y, c) } }
const shadow = (p, cx = 16, y = 29, rx = 9) => ellipse(p, cx, y, rx, 1, 'rgba(29,74,69,.22)')
const spark = (p, x, y, c = '#fff') => { p(x, y - 1, c); p(x - 1, y, c, 3, 1); p(x, y + 1, c) }
const keyring = (p, cx, cy) => { ring(p, cx, cy, 2.2, 3.8, '#b9bdc6'); p(cx - 1, cy - 4, '#e8ebf0', 3, 1) }
const chain = (p, x, y0, y1) => { for (let y = y0; y <= y1; y++) p(x, y, y % 2 ? '#b9bdc6' : '#8e94a0', y % 2 ? 1 : 2, 1) }

const DOL = ['....KKKKKK....', '...KFFFFFFK...', '..KFFFFFFFFK..', '.KFFFFFFFFFFK.', '.KKKKKKKKKKKK.', '..KFFFFFFFFK..', '..KFBFFFFBFK..', '..KFFFFFFFFK..', '..KFFFKKFFFK..', '..KFFFKKFFFK..', '..KFFFFFFFFK..', '...KFFBBFFK...', '...KFFFFFFK...', '..KFFFFFFFFK..', '.KFFFFFFFFFFK.', '.KFFKFFFFKFFK.', '.KFFFFFFFFFFK.', '..KFFFFFFFFK..', '..KFFFFFFFFK..', '..KKKKKKKKKK..']

const PRODUCTS = {
  // 설문대할망 흙 한 줌 키링: 고리·사슬에 매달린 한라산 모양 참
  'p-seolmundae-keyring': { bg: '#d6ecf8', draw: (p) => {
    shadow(p, 16, 30, 7); keyring(p, 16, 5); chain(p, 16, 9, 13)
    p(8, 14, '#2b3a4a', 16, 16); p(9, 15, '#a9d7f3', 14, 14)
    for (let x = 9; x < 23; x++) { const h = Math.round(7 * (1 - Math.pow(Math.abs(x - 16) / 7.5, 1.6))); for (let y = 0; y < h; y++) p(x, 27 - y, y < 2 ? '#8bd36b' : y < 5 ? '#4a9a52' : '#2F5D50') }
    p(9, 27, '#69b84a', 14, 2); p(15, 20, '#4FA3B7', 3, 1); p(18, 16, '#8a5a2e', 2, 1); p(20, 18, '#8a5a2e'); p(11, 17, '#a9763f', 2, 1); p(12, 14, '#2b3a4a', 8, 1); p(15, 14, '#b9bdc6', 2, 1) } },
  // 삼성혈 세 구멍 코스터 세트: 겹쳐 쌓은 나무 코스터, 맨 위에 구멍 세 개
  'p-samsung-coaster': { bg: '#e1efd2', draw: (p) => {
    shadow(p, 16, 29, 12)
    const coaster = (cy, top, rim, side) => { for (let d = 3; d >= 0; d--) ellipse(p, 16, cy + d, 12, 5, side); ellipse(p, 16, cy, 12, 5, rim); ellipse(p, 16, cy, 10, 4, top) }
    coaster(23, '#c9954f', '#8a5a2e', '#6b4423'); coaster(18, '#d9a066', '#8a5a2e', '#6b4423'); coaster(13, '#e7b47a', '#8a5a2e', '#6b4423')
    ;[[16, 9], [12, 13], [20, 13]].forEach(([x, y]) => { p(x - 1, y - 1, '#b07a45', 4, 4); p(x, y, '#2b1a0a', 2, 2) }) // 세 구멍: 밝은 테두리 + 어두운 점(얼굴처럼 보이지 않게 정삼각형으로)
    spark(p, 6, 6, '#ffe27a'); spark(p, 26, 8) } },
  // 혼인지 나무 상자 오르골: 크랭크와 음표
  'p-honinji-musicbox': { bg: '#fbe6cf', draw: (p) => {
    shadow(p, 15, 30, 11)
    p(5, 17, '#8a5a2e', 22, 12); for (let x = 8; x < 27; x += 4) p(x, 17, '#6b4423', 1, 12)
    p(4, 13, '#a9763f', 24, 5); p(5, 12, '#c18a4d', 22, 1); p(5, 21, '#d9a441', 22, 1); p(5, 26, '#d9a441', 22, 1); p(14, 18, '#ffd23f', 4, 4); p(15, 19, '#7a4b2a')
    p(27, 22, '#b9bdc6', 3, 1); p(29, 19, '#ffd23f', 2, 4)
    ;[[9, 6, '#1d4a45'], [18, 3, '#F28C28'], [24, 7, '#1d4a45']].forEach(([x, y, c]) => { p(x + 1, y, c, 1, 5); p(x, y + 4, c, 2, 2); p(x + 2, y, c, 2, 1) }) } },
  // 수월봉 눈물 샘물병: 물방울 라벨이 붙은 투명 물병
  'p-suwolbong-bottle': { bg: '#d8e6f6', draw: (p) => {
    shadow(p, 16, 30, 7)
    p(13, 3, '#F28C28', 6, 5); for (let x = 13; x < 19; x += 2) p(x, 3, '#c9650f', 1, 5); p(13, 3, '#ffb04a', 6, 1)
    p(14, 8, '#6aa7bd', 4, 3); p(12, 11, '#3b7f99', 8, 1); p(10, 12, '#3b7f99', 12, 17); p(11, 12, '#d9f4fb', 10, 16)
    p(11, 17, '#4FA3B7', 10, 11); p(11, 17, '#8fdcec', 10, 1)
    p(12, 20, '#fffdf7', 8, 6); for (let i = 0; i < 4; i++) p(16 - Math.floor(i / 2), 21 + i, '#4FA3B7', 1 + i, 1); p(15, 24, '#2a8cb0', 2, 1)
    p(11, 13, '#fff', 1, 10); spark(p, 26, 12) } },
  // 산방덕이 굴 캔들: 굴 입구가 난 돌 용기와 불꽃
  'p-sanbang-candle': { bg: '#e4def2', draw: (p) => {
    shadow(p, 16, 30, 10)
    ellipse(p, 16, 25, 11, 3, '#6e6c68'); p(5, 14, '#8a8780', 22, 12); ellipse(p, 16, 14, 11, 3, '#b9b6ad'); ellipse(p, 16, 14, 9, 2, '#fff3d6')
    p(6, 14, '#9b9992', 3, 11); p(23, 14, '#6e6c68', 4, 12)
    p(11, 20, '#1a1a1a', 10, 8); p(12, 19, '#1a1a1a', 8, 1); p(13, 18, '#1a1a1a', 6, 1); p(13, 24, '#F28C28', 6, 4); p(14, 25, '#ffd23f', 4, 3)
    p(16, 10, '#3a3a3a', 1, 4); [[16, 2, 1], [15, 3, 3], [15, 4, 3], [14, 5, 5], [14, 6, 5], [15, 7, 3], [15, 8, 3]].forEach(([x, y, w]) => p(x, y, '#F28C28', w, 1)); p(16, 3, '#ffd23f', 1, 5); p(15, 6, '#ffd23f', 3, 2); p(16, 6, '#fff3d6', 1, 2); spark(p, 6, 6, '#ffe27a'); spark(p, 26, 5, '#ffe27a') } },
  // 영등할망 미역 향 주머니: 끈으로 여민 주머니에 미역 수
  'p-yeongdeung-sachet': { bg: '#d3f0f0', draw: (p) => {
    shadow(p, 16, 30, 10)
    for (let y = 13; y < 29; y++) { const w = Math.min(11, 5 + Math.round(6.5 * Math.sin(((y - 13) / 15) * Math.PI * 0.5))); p(16 - w, y, '#2a8cb0', w * 2, 1); p(16 - w, y, '#52c0d8', 2, 1); p(16 + w - 2, y, '#1f6f93', 2, 1) }
    p(11, 10, '#1f6f93', 10, 3); p(10, 12, '#ffd23f', 12, 1) // 주머니 목과 끈
    p(11, 8, '#ffd23f', 4, 3); p(17, 8, '#ffd23f', 4, 3); p(12, 9, '#e9b93b', 2, 1); p(18, 9, '#e9b93b', 2, 1); p(15, 10, '#e9b93b', 2, 2) // 가운데 나비 리본
    p(14, 13, '#ffd23f', 1, 5); p(17, 13, '#ffd23f', 1, 5); p(14, 17, '#e9b93b', 1, 1); p(17, 17, '#e9b93b', 1, 1) // 늘어진 끈
    ;[[13, 27], [16, 28], [19, 27]].forEach(([x, y0], i) => { for (let y = 0; y < 8; y++) p(x + Math.round(Math.sin(y / 1.6 + i) * 1.2), y0 - y, y % 3 ? '#2d7a3e' : '#4aa357', 2, 1) }) // 미역 수
    spark(p, 5, 13); spark(p, 27, 22) } },
  // 자청비 오곡 씨앗 키트: 씨앗 봉투 다섯 개가 꽂힌 상자
  'p-jacheongbi-seeds': { bg: '#fbf0c8', draw: (p) => {
    shadow(p, 16, 30, 12)
    ;[['#e9b93b', 6, 7], ['#4aa357', 10, 5], ['#F28C28', 14, 8], ['#a9d7f3', 18, 5], ['#f6a1c0', 22, 7]].forEach(([c, x, y]) => { p(x, y, c, 4, 14); p(x, y, '#fff', 4, 1); p(x + 1, y + 3, '#fffdf7', 2, 3); p(x + 1, y + 4, '#8a5a2e') })
    p(4, 17, '#c9a26a', 24, 12); p(4, 17, '#a9803f', 24, 2); p(4, 27, '#a9803f', 24, 2); p(9, 20, '#fffdf7', 14, 7)
    for (let i = 0; i < 3; i++) { p(12 + i * 4, 21, '#4aa357', 1, 5); p(11 + i * 4, 21, '#e9b93b', 3, 2); p(12 + i * 4, 23, '#e9b93b', 1, 1) }
    spark(p, 28, 6, '#ffe27a') } },
  // 돌하르방 열쇠고리: 고리·사슬에 매달린 돌하르방
  'p-dolhareubang-keyring': { bg: '#e9e4d8', draw: (p) => {
    shadow(p, 16, 31, 6); keyring(p, 16, 4); chain(p, 16, 8, 10)
    DOL.forEach((row, j) => [...row].forEach((c, i) => { if (c === '.') return; const l = row[i - 1], r = row[i + 1]; p(9 + i, 11 + j, c === 'K' || c === 'B' ? '#2b2b2b' : l === 'K' ? '#b9b6ad' : r === 'K' ? '#77746e' : '#9c9993') }))
    spark(p, 4, 14); spark(p, 28, 20) } },
  // 감귤 한 상자: 감귤이 가득한 나무 상자
  'p-tangerine-box': { bg: '#fdebd0', draw: (p) => {
    shadow(p, 16, 30, 13)
    ;[[9, 14], [16, 12], [23, 14], [12, 17], [20, 17]].forEach(([x, y]) => { disc(p, x, y, 4, '#F28C28'); p(x - 2, y - 2, '#ffb04a', 2, 1); p(x - 1, y + 3, '#c9650f', 3, 1) })
    p(14, 6, '#6b4423', 2, 2); p(16, 5, '#2d7a3e', 5, 2); p(17, 4, '#4aa357', 3, 1)
    p(4, 18, '#c18a4d', 24, 11); p(4, 18, '#e0a763', 24, 1); p(4, 22, '#8a5a2e', 24, 1); p(4, 26, '#8a5a2e', 24, 1); p(4, 18, '#8a5a2e', 1, 11); p(27, 18, '#8a5a2e', 1, 11); p(13, 20, '#fffdf7', 6, 3); p(14, 21, '#F28C28', 4, 1) } },
}

const cache = new Map()
// 상품 id 에 해당하는 상품 그림이 있으면 { url, bg } 를, 없으면 null(호출하는 쪽이 상징 아이콘으로 대체)을 돌려준다.
export function productImage(id) {
  const def = PRODUCTS[id]; if (!def) return null
  if (cache.has(id)) return cache.get(id)
  const c = document.createElement('canvas'); c.width = N; c.height = N
  def.draw(pen(c.getContext('2d')))
  const out = { url: `url(${c.toDataURL()})`, bg: def.bg }; cache.set(id, out); return out
}
export const PRODUCT_IMAGE_IDS = Object.keys(PRODUCTS)
