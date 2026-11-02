# 스타터 적용 및 1단계 검증

- 작업 위치: Desktop/jeju_project_orca
- 앱 루트: jeju-ip-sample-solution/
- 브랜치: codex/starter-setup
- 기존 PROJECT_PLAN.md, AGENTS.md, 루트 README.md 및 Git 이력 보존.
- 강사 제공 React(Vite), Router, Zustand, Bootstrap/Bootswatch, Supabase, api/server 구조와 소스 보존.

## 실행
앱 루트에서 npm ci 후 npm run dev. 브라우저에서 http://localhost:5173 접속.
npm run build로 배포용 dist 생성, npm run preview로 빌드 미리보기.
Vite는 프런트엔드만 실행한다. /api 서버 함수 통합 실행은 추후 Vercel 개발 환경에서 검증한다.
Vercel 배포 시 Root Directory는 jeju-ip-sample-solution으로 설정한다.

## 2026-11-02 검증 결과
- Node v26.13.0 / npm 11.20.0.
- npm ci: 성공, 150개 패키지 설치. package.json과 잠금 파일 수정 없음.
- 선택적 macOS 파일 감시 패키지 fsevents의 설치 스크립트 승인 경고가 있었으나 실행/빌드 성공. 추가 승인하지 않음.
- npm run dev: Vite 정상 기동 및 HTTP 200.
- 실제 Chrome headless 검증: 홈, 관광·문화, 국가유산, AI 가이드, 내 즐겨찾기 메뉴 이동 성공.
- /places, /heritage, /agent, /my 직접 접근 및 새로고침 성공.
- Zustand 닉네임 상태의 새로고침 후 유지 확인. 검증용 격리 브라우저에서만 수행.
- JavaScript pageerror 0건.
- npm run build: 성공, 393개 모듈 변환.
- npm run lint: 종료 코드 0. 기존 Places.jsx와 Heritage.jsx 각각 set-state-in-effect 및 exhaustive-deps 경고, 총 4건. 신화 페이지 구현 단계에서 해당 데이터 로딩 Effect를 정리할 예정.
- .env.local 생성 및 API 키 입력 없음. Supabase 연결/데이터 변경 없음.
- Vite만 실행하여 /api 호출은 정상 데이터 검증 대상에서 제외. 외부 요청은 브라우저 검사에서 차단. 기존 예시의 API 오류 표시를 정상 데이터로 간주하지 않음.
- 백업 Desktop/vibe/jeju_project_orca 수정 없음.

## 다음 단계
신화 중심 라우트/페이지 및 테마 설계 후 구현. 공공 API 3개 실응답 검증, 서버 함수와 도구 공유, AI 호출 이력 UI, 전용 Supabase 테이블/권한 검토를 순차 진행.
