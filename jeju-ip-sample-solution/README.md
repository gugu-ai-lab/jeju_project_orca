# 제주 IP 프로젝트 스타터 (Vite + React + Router + Zustand + Bootstrap + Supabase)

## 실행
```bash
npm install
cp .env.example .env.local     # 값 채우기
npm run dev                    # 화면 + 동일 api/ 핸들러 (http://localhost:5173)
vercel dev                     # 화면 + /api 서버 함수 (http://localhost:3000)  ← STEP 1부터 이걸로
```

## 구조
```
api/        Vercel 서버 함수 (/api/파일이름) — 비밀 키는 여기서만
server/     공공데이터 API 호출 함수 (api/ 와 에이전트가 함께 사용)
src/
  main.jsx          디자인 테마 선택 + 라우터 시작
  router.jsx        메뉴(NAV_ITEMS) + 주소별 페이지
  layouts/          공통 틀 (메뉴·푸터·알림)
  store/            Zustand 전역 상태 (닉네임·알림·즐겨찾기)
  lib/supabase.js   Supabase 연결
  api/client.js     화면 → /api 호출 함수
  components/       재사용 컴포넌트 (ItemCard, PageHeader, Status)
  pages/            페이지
```

## 디자인 바꾸기
`src/main.jsx` 의 `bootswatch/dist/minty/...` 에서 `minty` 를 `lux`, `flatly`, `cosmo`, `sketchy` 등으로 바꾸면 전체 디자인이 바뀝니다. (https://bootswatch.com)

※ Places·Heritage 는 샘플입니다. 주제는 각자 정해서 바꾸세요.


## OpenAI 신화 여행 안내원
- 기본 모델: gpt-6-luna. Responses API의 Function Calling 사용. Claude 호출 및 공용 예산 사용 없음.
- 앱 루트 .env.local의 OPENAI_API_KEY에 사용자 본인의 앱용 키를 직접 설정한다. VITE_ 접두사를 사용하지 않는다.
- 로컬 파일에 OPENAI_API_KEY가 없거나 비어 있으면 AI만 대기 상태가 된다. 코딩 CLI의 상속된 키를 대신 사용하지 않는다.
- npm run dev는 화면과 동일한 api/ 핸들러를 실행한다. 환경파일 수정 후 서버를 재시작한다. 배포는 기존 Vercel api/ 서버 함수와 서버 환경변수를 사용한다.
- /agent에서 도구 목록·질문·호출 내역·실제 결과 요약을 확인한다. 직접 자료 조회는 AI의 자율 호출과 구분한다.
- 도구: search_myths(자료 목록), search_culture(역사문화), get_weather(기상청), search_locations(위치).
- 화면과 에이전트는 server/myth-tools.js의 같은 함수를 사용한다. 역사문화와 날씨는 DATA_GO_KR_KEY 및 해당 서비스 활용 승인이 필요하다.
- 역사문화 검색은 최대 500건 범위이며 전체를 읽지 못했으면 부분 검색으로 표시한다. 신화 API는 줄거리가 아닌 자료 목록이다.
- 비용 제한: 질문 1500자, 최근 대화 6개·각 600자, 질문당 모델 요청 최대 4회, 도구 실행 최대 3회, 응답당 출력 최대 600토큰, reasoning none, 병렬 호출 끔, 자동 재시도 없음.
- 모델에는 도구별 상위 3건과 짧은 설명만 전달한다. 공공데이터 검색 캐시는 5분이다.
- 제한은 질문당 상한이며 계정 전체의 $5 지출을 보장하는 하드 캡은 아니다. 공개 배포 전 인증/사용량 제한을 추가해야 한다.
- npm test: 외부 과금 호출 없이 OpenAI 응답 대역으로 함수 선택·결과 반환·호출 상한·오류 비공개·키 누락을 검증한다. 테스트 대역은 실제 앱 답변에 사용되지 않는다.
- OpenAI 키와 공급자 원본 오류는 화면/로그에 출력하지 않는다. 실제 OpenAI 자율 선택과 응답 품질은 사용자 키 연결 후 검증해야 한다.
- 공식 모델: https://developers.openai.com/api/docs/models/gpt-6-luna
- Function Calling: https://developers.openai.com/api/docs/guides/function-calling

### 유료 검증 1회

사용자가 로컬 키를 설정한 뒤 npm run test:openai-once를 수동 실행한다. 실행당 OpenAI HTTP 요청은 최대 1회이며 모델이 선택한 공공데이터 도구를 실행한 뒤 중단한다. 결과를 모델로 되돌리는 후속 요청은 하지 않는다. 키는 출력하지 않고 사용 토큰·도구 결과 상태만 출력한다. npm test에는 포함되지 않는다.

## TourAPI 보완 도구

search_tour_places는 기존 DATA_GO_KR_KEY로 KorService2의 searchKeyword2와 detailCommon2를 호출한다. 제주 법정동 코드 50을 사용하며 검색 결과 상위 3건의 주소·좌표·소개만 조회한다. 신화와 관광지의 관계를 임의로 확정하지 않는다. 기존 신화·역사문화·기상청·위치 도구와 Places의 배열 응답 형식을 유지한다. 인증 오류는 HTTP 상태와 제공기관 오류 코드로 표시하고 원본 오류 본문/요청 URL/키 값은 출력하지 않는다. 상세 조회만 실패하면 주소·좌표를 유지하고 부분 결과로 표시한다. OpenAI 호출 상한은 그대로 유지한다.


## 통합 프론트엔드

Gemini b7ab38d의 학생용 지도·신화 탐험·설문대할망 퀴즈 퍼즐과 Codex 007b77d의 API·OpenAI·Supabase·사진 처리를 통합했습니다. 지도는 2.5D SVG가 기본이며 3D 컴포넌트는 보존합니다. 퍼즐 진행은 현재 세션 상태이며 DB 저장은 적용하지 않았습니다.
