# TourAPI 검증 및 도구 추가 (2026-11-02)

- 기존 DATA_GO_KR_KEY로 한국관광공사 국문 관광정보 서비스_GW 호출 성공.
- searchKeyword2(삼성혈, lDongRegnCd=50): HTTP 200 / resultCode 0000 / OK / 1건.
- detailCommon2(contentId=127744): HTTP 200 / resultCode 0000 / OK / 소개 원문 474자.
- 실제 장소: 제주 삼성혈, 제주특별자치도 제주시 삼성로 22.
- 위도 33.5041459335 / 경도 126.5289459792.
- 공식 서비스: https://www.data.go.kr/data/15101578/openapi.do
- 호출 기본 주소: https://apis.data.go.kr/B551011/KorService2
- 키 및 키가 포함된 요청 URL은 기록하지 않음.

## 구현
- search_tour_places 도구 추가. React 직접 조회와 AI Function Calling이 server/tour.js를 공유.
- 제주 법정동 코드 50으로 제한. 검색 상위 3건만 상세 조회해 주소·좌표·소개 보완.
- 관광 데이터만으로 신화와 장소의 관계를 확정하지 않도록 도구 설명에 명시.
- 기존 Places 화면의 배열 응답과 신화·역사문화·기상청·위치 도구 유지.
- 인증 실패는 HTTP 상태와 제공기관 오류 코드를 안전하게 표시. 원본 응답 본문·키·요청 URL 출력 금지.
- 상세 조회만 실패하면 주소·좌표를 유지하고 부분 결과와 상세 오류 상태 표시.
- 기존 모델 요청 4회 / 도구 3회 상한 유지. OpenAI 키·모델·Supabase 설정 변경 없음.

## 검증
- 실제 공공데이터 인증/검색/상세 응답 성공.
- npm test: 15개 통과. 인증 오류가 HTTP 200에 담긴 경우, XML 게이트웨이 오류, 상세 실패, Tour 실패 후 기상청 도구 실행 검사.
- npm run build 성공.
- npm run lint 종료 코드 0. 기존 Places/Heritage Effect 경고 4건 및 빌드 번들 크기 경고 유지.
- 실제 브라우저에서 삼성혈 이름·주소·좌표·소개 표시 확인.
- 기존 5개 메뉴 이동 성공, JavaScript pageerror 0건.
- 이번 작업의 OpenAI 유료 호출 0회. AI의 TourAPI 자율 선택에 대한 실제 유료 검증은 하지 않음.
- .env.local과 실제 키, Supabase 데이터, Desktop/vibe 백업본 수정 없음.
