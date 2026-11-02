# 공통 이야기 카탈로그

`storyCatalog.js`의 `STORY_CATALOG`가 Home·Explore·상세 페이지의 공통 전체 목록이다.

- `studentStories.js`: 기존 Gemini Home의 학생용 이야기 본문·질문·장면·출처를 그대로 옮긴 데이터.
- `mythStories.js`: 기존 원문 및 로컬 삽화 정보. 삭제·덮어쓰지 않았다.
- `external/verified-stories.json`: 추후 검증 결과를 추가하는 입력. 같은 ID는 갱신하며 중복으로 세지 않는다.
- `jejuMapPins.json`: 실제 지도 장소와 좌표. 이야기 출처 검증과 장소 검증은 별개다.

`HOME_STORIES`는 전체 목록 중 검증된 추천 항목을 최대 7개 선택한다. 전체 이야기 수·추천 수·실제 장소 수는 각각 계산한다. 장소가 없는 자청비도 정상적인 이야기다.

새 항목은 `id`, `title`, `category`, `source`, `verification`, `scenes`를 기준으로 검토한다. Home 추천으로 표시하려면 기존 카드가 사용하는 `question`, `shortIntro`, `tag`, `tone`, `icon`과 `featured: true`를 준비한다. 숫자를 맞추기 위해 검증 전 후보를 자동 등록하지 않는다.

검증 근거와 이동 내역은 `docs/STORY_CATALOG_ALIGNMENT.md` 및 루트 `MYTH_CONTENT_VERIFICATION.md`를 참고한다. 학생용 풀이와 원문은 구분하며, 새 자료의 이용 조건과 실제 장소 연결은 별도로 확인한다.
