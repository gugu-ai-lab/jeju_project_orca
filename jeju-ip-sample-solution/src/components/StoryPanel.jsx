import { Link } from 'react-router-dom'
import SourceCredit from './SourceCredit'
import SceneNav from './SceneNav'

// 선택한 신화의 이야기 + 이미지 영역 — 표현 전용.
//   title  : 신화 제목
//   scene  : { id?, caption?, text?, image?: { src, alt, width, height } }  (없으면 빈 상태)
//   source : { label, url?, license? }
//   sceneIndex/sceneCount/onSceneChange : 장면 전환(선택)
//   preview: true 이면 "예시 데이터" 배지를 표시
//   chapterLabel, subtitle, scenes, placeBridge, emptyStoryNote : 몰입형 화첩·탐험 연결 선택 속성
// 이미지는 원본 비율을 유지한다(width/height 속성 + height:auto).
export default function StoryPanel({
  title,
  scene,
  source,
  preview,
  sceneIndex = 0,
  sceneCount = 1,
  onSceneChange,
  chapterLabel,
  subtitle,
  scenes,
  placeBridge,
  emptyStoryNote,
}) {
  const image = scene?.image
  const text = scene?.text

  return (
    <article className="story-panel surface">
      <div className="story-figure" key={`fig-${scene?.id ?? 'empty'}`}>
        <div className="story-figure-header">
          <span className="story-plate-badge">
            <i className="bi bi-journal-richtext me-1" />
            {sceneCount > 0 ? `화첩 제 ${sceneIndex + 1} 장면 / 총 ${sceneCount} 장면` : '현장 전승 기록'}
          </span>
          {image && (
            <span className="story-plate-ratio">
              원본 비율 보존 ({image.width}×{image.height})
            </span>
          )}
        </div>

        <div className="story-figure-mat">
          {image ? (
            <img
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              loading="lazy"
            />
          ) : (
            <div className="story-figure-empty">
              <span className="story-figure-emblem" aria-hidden="true">
                <i className="bi bi-compass" />
              </span>
              <strong className="font-myth fs-5 text-forest">독립 삽화 미수록 이야기</strong>
              <p className="mb-0 small text-center">
                공식 삽화 아카이브(ZIP 42점)에 해당 제목의 단독 그림이 없어,
                다른 신화 삽화를 임의 전용하지 않고 유적 연결 정보만 정직하게 안내합니다.
              </p>
            </div>
          )}
        </div>

        {Array.isArray(scenes) && scenes.length > 1 && onSceneChange && (
          <div className="story-plate-tabs" role="tablist" aria-label="화첩 장면 바로가기">
            {scenes.map((item, idx) => (
              <button
                key={item.id || idx}
                type="button"
                role="tab"
                aria-selected={idx === sceneIndex}
                className={`story-plate-tab${idx === sceneIndex ? ' is-active' : ''}`}
                onClick={() => onSceneChange(idx)}
              >
                <span className="story-plate-tab-num">0{idx + 1}</span>
                <span className="story-plate-tab-label">{item.caption || `${title} 장면 ${idx + 1}`}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="story-copy" key={`copy-${scene?.id ?? 'empty'}`}>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          {chapterLabel && <span className="story-chapter-tag">{chapterLabel}</span>}
          {preview ? (
            <span className="preview-badge">삽화 아카이브 외 · 현장 유적 기록</span>
          ) : (
            <span className="verified-badge">공공데이터 원문 대조 완료</span>
          )}
          {scene?.caption && <span className="story-caption">{scene.caption}</span>}
        </div>

        <h3 className="story-heading font-myth mt-2 mb-1">{title}</h3>
        {subtitle && <p className="story-subheading mb-3">{subtitle}</p>}

        {text ? (
          <div className="story-narrative-box">
            <div className="story-narrative-label">
              <i className="bi bi-quote me-1" />
              신화전설_삽화_설명.csv 원문 기록
            </div>
            <p className="story-text mb-0">{text}</p>
          </div>
        ) : (
          <div className="story-empty">
            <i className="bi bi-journal-text me-2" />
            {emptyStoryNote || '이 장면의 본문은 원문 파일명 대조 및 출처 확인 후 표시됩니다.'}
          </div>
        )}

        <SceneNav index={sceneIndex} total={sceneCount} onChange={onSceneChange} />

        {placeBridge && (
          <div className="story-place-bridge mt-4">
            <div className="story-place-bridge-head">
              <div>
                <span className="story-place-eyebrow">
                  <i className="bi bi-geo-alt-fill me-1" />
                  신화가 깃든 실제 제주 여정 · {placeBridge.relationBadge}
                </span>
                <h4 className="story-place-title font-myth mb-1">{placeBridge.placeName}</h4>
              </div>
              {placeBridge.regionBadge && (
                <span className="story-region-pill">{placeBridge.regionBadge}</span>
              )}
            </div>
            <p className="story-place-desc mb-2">{placeBridge.description}</p>
            <div className="story-place-evidence small">
              <i className="bi bi-patch-check-fill me-1" />
              <strong>연결 근거:</strong> {placeBridge.evidence}
            </div>
            <div className="story-place-actions mt-3">
              {placeBridge.storyLink && (
                <Link to={placeBridge.storyLink} className="btn btn-primary btn-sm">
                  <i className="bi bi-book-half me-1" />이야기 상세 열람
                </Link>
              )}
              <Link to="/places" className="btn btn-outline-sea btn-sm">
                <i className="bi bi-map me-1" />관광·문화 API 조회
              </Link>
              <Link to="/heritage" className="btn btn-outline-sea btn-sm">
                <i className="bi bi-bank me-1" />국가유산 확인
              </Link>
              <Link to="/agent" className="btn btn-citrus btn-sm">
                <i className="bi bi-stars me-1" />AI 안내원에게 질문
              </Link>
            </div>
          </div>
        )}

        <SourceCredit source={source} />
      </div>
    </article>
  )
}
