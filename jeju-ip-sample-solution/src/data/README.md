# 이야기 카탈로그 데이터

`storyCatalog.js` 가 내장 항목과 `external/verified-stories.json` (Gemini 검증 결과) 을 합쳐 화면에 제공한다.
화면 컴포넌트는 항목 개수에 의존하지 않는다 — 항목을 추가해도 UI 수정이 필요 없다.

## 항목 형식 (external/verified-stories.json 은 이 객체의 배열)
```json
{
  "id": "고유-아이디(영문/숫자/하이픈)",
  "title": "제목",
  "category": "myth | legend | folktale | unclassified",
  "summary": "한두 문장 요약(선택, 출처 있는 문장만)",
  "place": "연결 장소(선택, 출처 확인된 경우만)",
  "scenes": [{ "id": "s1", "caption": "", "text": "", "image": { "src": "/myth/x.jpg", "alt": "", "width": 0, "height": 0 } }],
  "source": { "label": "", "url": "", "license": "" },
  "verification": "verified | pending"
}
```
- `source` 가 없거나 `verification` 이 `verified` 가 아니면 화면에 "출처 검증 대기"로 표시된다.
- 분류(`category`)는 자료가 밝힌 경우에만 `myth/legend/folktale` 로 지정한다. 모르면 `unclassified`.
- 본문이 없는 항목은 이야기를 생성하지 않고 빈 상태로 표시한다.
