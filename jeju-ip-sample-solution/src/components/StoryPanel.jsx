import SourceCredit from './SourceCredit'

// 선택한 신화의 이야기 + 이미지 영역 — 표현 전용.
//   title  : 신화 제목
//   scene  : { caption?, text?, image?: { src, alt, width, height } }  (없으면 빈 상태)
//   source : { label, url?, license? }
//   preview: true 이면 "예시 데이터" 배지를 표시
// 이미지는 원본 비율을 유지한다(width/height 속성 + height:auto).
export default function StoryPanel({ title, scene, source, preview }) {
  const image = scene?.image
  const text = scene?.text
  return (
    <article className="story-panel surface">
      <div className="story-figure">
        {image ? (
          <img src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" />
        ) : (
          <div className="story-figure-empty"><i className="bi bi-image" />이미지 준비 중</div>
        )}
      </div>
      <div className="story-copy">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          {preview && <span className="preview-badge">예시 데이터 · 미리보기</span>}
          {scene?.caption && <span className="story-caption">{scene.caption}</span>}
        </div>
        <h3 className="h4 mt-2">{title}</h3>
        {text ? (
          <p className="story-text">{text}</p>
        ) : (
          <div className="story-empty">
            <i className="bi bi-journal-text me-2" />
            이 이야기의 본문은 출처 확인 후 표시됩니다.
          </div>
        )}
        <SourceCredit source={source} />
      </div>
    </article>
  )
}
