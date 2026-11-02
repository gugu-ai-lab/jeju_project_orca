// 픽셀 제주 지도 배경(public/myth-pixel/jeju-pixel-world-map-bg-draft-01.jpg, 1376×768, 16:9)용 핀 위치.
// x, y 는 이미지 가로·세로 대비 %. 실제 좌표(jejuMapPins.json 의 realGeoCoords)를 섬 모양에 맞춰 옮긴 뒤,
// 핀끼리 겹치지 않고 육지 위에 오도록 손으로 보정한 "일러스트 위치"이며 측량 좌표가 아니다.
// 실제 위치는 카카오맵·길찾기가 realGeoCoords 로 처리한다.
// 장소가 없는 신화(자청비)는 의도적으로 넣지 않는다.
export const PIXEL_MAP = { src: '/myth-pixel/jeju-pixel-world-map-bg-draft-01.jpg', width: 1376, height: 768 }

export const PIXEL_MAP_COORDS = {
  'pin-seolmundae': { x: 67, y: 37 },
  'pin-samsinin': { x: 43, y: 25 },
  'pin-yeongdeung': { x: 55.5, y: 24 },
  'pin-honinji': { x: 83.6, y: 35.2 },
  'pin-suwolbong': { x: 14.9, y: 56 },
  'pin-sanbangdeok': { x: 28, y: 71 },
}
