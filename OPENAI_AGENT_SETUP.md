# OpenAI 안내원 전환 검증 (2026-11-02)

## 현재 설정
- 앱 위치: Desktop/jeju_project_orca/jeju-ip-sample-solution
- 모델: gpt-6-luna / OpenAI Responses API / Function Calling.
- reasoning none, 출력 최대 600토큰, 질문 최대 1500자.
- 최근 대화 6개·각 600자. 모델 요청 최대 4회, 도구 실행 최대 3회.
- 병렬 도구 호출과 자동 재시도 없음. store false.
- 모델에 전달하는 도구 결과는 상위 3건과 짧은 설명으로 제한.
- Claude SDK 및 호출 코드 제거. Supabase 코드/데이터와 백업 폴더는 수정하지 않음.
- OPENAI_API_KEY는 서버 전용이며 비어 있으면 AI만 대기 상태. 로컬 상위 프로세스의 키를 대신 사용하지 않음.
- .env.local은 Git에서 제외. 실제 키 값은 로그/화면에 출력하지 않음.

## 선택 이유
- 공식 표준 요금(100만 토큰): gpt-6-luna 입력 $0.10 / 출력 $0.50.
- 초기 검토한 gpt-5.6-luna 입력 $0.20 / 출력 $1.20 대비 저렴하며 Function Calling 및 reasoning none 지원.
- 계정별 모델 접근 가능 여부는 실제 호출 전까지 미확인.
- 공식 문서: https://developers.openai.com/api/docs/models/gpt-6-luna

## 검증 완료
- npm test: 9개 통과. 모델 응답 대역으로 도구 선택/결과 반환, 키 누락, Claude 독립성, 인자 검증, 도구 호출 상한, 오류 비공개, 기상청 성공/실패를 검사.
- 실제 브라우저: 키 누락 대기 상태와 비활성 전송, 기존 5개 메뉴 이동, 기상청 지역 선택, 모바일 가로 넘침 없음, JavaScript pageerror 0건.
- 브라우저 대역 검사: 도구 성공/실패, 인자, 출처, 실제 결과 요약 펼쳐보기.
- npm run build 성공. 500kB 번들 경고가 남음.
- npm run lint 종료 코드 0. 기존 Places/Heritage Effect 경고 총 4건.
- 실제 공공데이터 도구: search_myths('설문대') 4건, search_culture('삼성혈') 1건, get_weather('제주시') 6건 정상 응답.
- 역사문화 일반정보 조회는 이 요청에서 전체 범위 검색 완료로 응답함. 도구 실행은 유료 OpenAI 요청을 포함하지 않음.

## 유료 검증 상태
- OPENAI_API_KEY 미입력 상태여서 실제 유료 OpenAI 요청 0회. 실제 토큰 사용량은 아직 없음.
- npm run test:openai-once 준비: 실행당 유료 HTTP 요청 최대 1회, 선택된 공공데이터 도구 실행 후 중단.
- 후속 모델 요청 및 자동 재시도 없음. 도구 결과를 종합한 최종 답변은 이 단일 요청 검사에 포함하지 않음.
- 실제 모델의 도구 선택·계정 접근 권한·사용 토큰은 사용자 키 입력 후 별도 보고.
