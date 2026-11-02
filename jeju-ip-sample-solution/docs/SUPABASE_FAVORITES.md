# 제주 신화 즐겨찾기 연결 안내

## 구현 범위
- 새 프로젝트 bhmffgtvdtfpneotjrty의 public.jeju_myth_favorites만 사용한다.
- 실제 Publishable key와 익명 사용자 JWT로 검증했다. Secret/service_role 키를 사용하지 않는다.
- DB 스키마·RLS 정책을 추가/변경하지 않았다. 기존 수업 DB에는 접속하지 않았다.
- 기존 src/ 프론트엔드, Store, 라우트, Supabase 클라이언트 파일은 수정하지 않았다.
- 따라서 현재 기존 화면의 favorites 예제는 그대로다. Claude가 아래 새 함수를 연결해야 제품 화면에서도 새 테이블을 사용한다.

## 파일
- services/supabase-session.js: 새 프로젝트 URL/Publishable key 검사, 세션 생성·재사용, 요청 대상 제한.
- services/myth-favorites.js: 저장·조회·삭제 서비스. UI·React·Zustand와 독립적.
- services/browser-favorites.js: 브라우저용 단일 인스턴스 및 편의 함수.
- scripts/test-favorites-live.mjs: 수동으로만 실행하는 실DB 보안 검증. npm test에 포함되지 않는다.

## 환경변수
VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 기존 .env.local에서 읽는다.
VITE_SUPABASE_ANON_KEY 값은 Publishable key만 허용한다. 키 값은 코드·로그·화면에 출력하지 않는다.
허용 프로젝트는 https://bhmffgtvdtfpneotjrty.supabase.co로 고정한다.
실행 중인 개발 서버에서 환경변수가 바뀌면 재시작한다.

## Claude 화면에서 사용
아래 경로는 src/pages 또는 src/store 안의 파일을 기준으로 한다.

~~~js
import {
  ensureMythFavoritesSession,
  saveMythFavorite,
  listMythFavorites,
  deleteMythFavorite,
} from '../../services/browser-favorites.js'

// 기존 세션이 있으면 검증·재사용하고, 없을 때만 익명 인증한다.
await ensureMythFavoritesSession()

const { favorite, created } = await saveMythFavorite({
  storyId: 'story-jacheongbi',
  storyTitle: '자청비',
})
// created=false이면 이미 저장된 행을 반환한다. 기존 제목을 덮어쓰지 않는다.

const favorites = await listMythFavorites()

const { deleted, deletedCount } = await deleteMythFavorite('story-jacheongbi')
// 이미 없으면 deleted=false, deletedCount=0
~~~

반환되는 즐겨찾기 형식:
~~~js
{
  id,         // 즐겨찾기 UUID
  userId,     // 소유자 UUID (화면에 노출할 필요 없음)
  storyId,    // 이야기 고유 ID
  storyTitle, // 저장 당시 제목
  createdAt,  // 저장 시각
}
~~~

- storyId는 이야기 레지스트리의 안정적인 ID를 사용한다. API 목록의 배열 인덱스나 제목을 ID로 쓰지 않는다.
- 카드 버튼은 저장 함수를 호출하고 성공 후 목록을 재조회한다.
- 페이지 진입/새로고침 시 목록을 DB에서 재조회한다. 로컬 목록만 남아 있는 것을 DB 영속성으로 간주하지 않는다.
- 소유자·저장 시각·행 UUID를 호출자가 넘기지 않는다. insert payload에는 story_id/story_title만 있다.
- 기능은 업데이트 없이 insert/select/delete만 사용한다. SQL의 제한된 컬럼 INSERT 권한과 호환된다.
- 경로 이동 시 signOut하거나 매번 새 익명 계정을 만들지 않는다.
- 두 사용자의 즐겨찾기는 storyId가 같아도 별도 행으로 저장된다.
- 기존 src/store/useAppStore.js의 nickname 기반 favorites 예제는 이 모듈과 별개다. 해당 코드를 무심코 재사용하지 않는다.

## 세션 및 보호
- 전용 저장 키: jeju-myth-auth-bhmffgtvdtfpneotjrty-v1.
- 같은 브라우저/동일한 사이트 주소(개발 포트 포함)에서 세션이 유지되면 새로고침 후 같은 계정으로 조회한다.
- 브라우저 데이터 삭제, 로그아웃, 다른 기기/다른 사이트 주소에서는 익명 계정을 자동 복구할 수 없다.
- 세션 복구 오류 시 임의로 새 사용자로 바꾸지 않고 안전한 오류를 반환한다.
- 연속/동시 초기화는 같은 클라이언트에서 하나의 익명 인증 요청을 공유한다.
- 요청은 새 프로젝트의 /auth/v1/* 및 /rest/v1/jeju_myth_favorites로만 허용한다.
- 서버 Secret key로 사용자별 RLS를 우회하는 경로는 없다.

## 오류 처리
try/catch에서 error.code와 안전한 message를 사용한다. 원본 공급자 오류나 인증 토큰을 화면/로그에 출력하지 않는다.
- WRONG_PROJECT / INVALID_PUBLISHABLE_KEY: 환경 설정 확인.
- AUTH_UNAVAILABLE: 익명 로그인 설정/네트워크 확인.
- SESSION_UNAVAILABLE: 기존 세션 복구 실패. 자동으로 다른 사용자로 전환하지 않음.
- INVALID_STORY: ID 1~128자, 제목 1~200자.
- TABLE_NOT_READY / ACCESS_DENIED: 테이블·권한·RLS 확인.
- DATABASE_UNAVAILABLE: 저장소 요청 실패. 실패를 빈 목록이나 삭제 성공으로 숨기지 않음.

## 2026-11-02 검증 결과
### 기능별 실제 검증
1. 익명 인증 성공, 테이블 다섯 컬럼 조회 HTTP 200.
2. 미인증 조회 HTTP 401 / Postgres 42501로 거부.
3. 본인 소유 저장, 동일 이야기 중복 방지, 기존 제목 유지.
4. 본인 목록 조회 성공.
5. 본인 행 삭제 1건, 재조회에서 사라짐, 반복 삭제 0건.
각 기능은 테스트 후 별도 Git 커밋했다.

### 실제 익명 사용자 A/B 보안 검증
- 같은 storyId로 각자 저장 성공.
- 서비스의 user_id 필터 없이 DB에 요청해도 본인 행만 반환.
- B의 A 행 ID 직접 조회 0건, 직접 삭제 0건. 이후 A의 행이 그대로 남아 있음.
- 타인 user_id 지정 INSERT 거부(42501).
- UPDATE 거부(42501).
- 미인증 SELECT 거부(42501).
- 저장/조회/삭제 정책은 실제 동작으로 검증했다. Publishable key로 관리자 카탈로그를 조회하지 않았으므로 정책 이름·개수를 직접 열람한 것은 아니다.

### 실제 브라우저 검증
기존 React 화면 대신 코드 변경 없는 격리 테스트 페이지에서 새 브라우저 모듈을 사용했다.
- 익명 사용자 A 저장 → 실제 새로고침 → 동일 사용자 ID와 같은 즐겨찾기 확인.
- 별도 브라우저 사용자 B는 다른 인증 ID.
- B의 A 행 직접 조회·삭제는 0건.
- 본인 삭제 후 실제 새로고침에서도 삭제 상태 유지.
- 기존 프론트엔드 파일 수정 없음. 관리자 키/OpenAI 사용 없음.

### 데이터 정리
- 테스트는 임의 UUID가 포함된 전용 storyId로만 수행했고 이번에 만든 즐겨찾기 행만 정리했다.
- 기존 즐겨찾기나 기존 수업 데이터는 삭제하지 않았다.
- 테스트용 익명 Auth 계정은 관리자 권한으로 삭제하지 않았다.

## 테스트 명령
외부 접속 없이 실행되는 회귀 테스트:
~~~bash
npm test
npm run build
npm run lint
~~~

수동 실DB 보안 검증:
~~~bash
node --use-system-ca scripts/test-favorites-live.mjs
~~~

이 명령은 실행할 때마다 새 프로젝트에 익명 사용자 2명을 만들고 테스트 행을 저장·조회·삭제한 뒤 정리한다.
사용자 ID/키/토큰을 출력하지 않는다. DB 마이그레이션이나 관리자 API는 호출하지 않는다.
실제 브라우저 새로고침 검증은 별도로 수행한 결과이며, Node 스크립트의 SDK 인스턴스 재생성 테스트와 구분한다.
