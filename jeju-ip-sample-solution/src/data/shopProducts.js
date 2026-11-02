// 기념품 목록 — 체험용 상품 데이터다. 이야기와의 연결은 상징 도트 아이콘(lib/pixelSymbols.js)의 모양에서 따왔다.
// symbol: storySymbol(id) 에 쓰는 키. 가격은 원 단위 정수.
export const PRODUCTS = [
  { id: 'p-seolmundae-keyring', name: '설문대할망 흙 한 줌 키링', price: 4500, symbol: 'seolmundae', desc: '치마폭에서 흘러내리는 흙과 한라산을 닮은 도트 키링' },
  { id: 'p-samsung-coaster', name: '삼성혈 세 구멍 코스터 세트', price: 6000, symbol: 'samsinin', desc: '땅에 난 세 개의 구멍을 새긴 코스터 3장' },
  { id: 'p-honinji-musicbox', name: '혼인지 나무 상자 오르골', price: 15800, symbol: 'honinji', desc: '연못 위에 뜬 나무 상자 모양의 작은 오르골' },
  { id: 'p-suwolbong-bottle', name: '수월봉 눈물 샘물병', price: 9800, symbol: 'suwolbong', desc: '절벽 끝 눈물방울을 담은 투명 물병' },
  { id: 'p-sanbang-candle', name: '산방덕이 굴 캔들', price: 12000, symbol: 'sanbangdeok', desc: '산방산 굴 모양 용기에 담긴 향초' },
  { id: 'p-yeongdeung-sachet', name: '영등할망 미역 향 주머니', price: 5500, symbol: 'yeongdeung', desc: '바람과 미역을 그린 작은 향 주머니' },
  { id: 'p-jacheongbi-seeds', name: '자청비 오곡 씨앗 키트', price: 7000, symbol: 'jacheongbi', desc: '곡식 이삭 그림 포장의 씨앗 다섯 봉지' },
  { id: 'p-dolhareubang-keyring', name: '돌하르방 열쇠고리', price: 4000, symbol: 'dolhareubang', desc: '벙거지 쓴 돌하르방 도트 열쇠고리' },
  { id: 'p-tangerine-box', name: '감귤 한 상자', price: 18000, symbol: 'tangerine', desc: '도트 감귤이 가득 담긴 한 상자' },
]
export const getProduct = (id) => PRODUCTS.find((p) => p.id === id)
