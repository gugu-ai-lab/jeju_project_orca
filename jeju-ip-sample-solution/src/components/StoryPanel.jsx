import { useState } from 'react'
import { Link } from 'react-router-dom'
import SourceCredit from './SourceCredit'
import SceneNav from './SceneNav'

// 장면별 부드러운 파스텔 그림책 카드 일러스트 (강한 빨강·주황 없이 편안한 파스텔 톤)
function ScenePastelArt({ storyId, sceneIndex }) {
  const isSecond = sceneIndex === 1
  return (
    <div className={`scene-pastel-canvas tone-${isSecond ? 'mint' : 'sky'}`}>
      <svg viewBox="0 0 280 200" className="scene-pastel-svg" aria-hidden="true">
        <circle cx="225" cy="46" r="22" fill="#FFFDF7" opacity="0.92" />
        <path d="M20 165 Q85 75 150 165 Z" fill="#A9D7F3" opacity="0.65" />
        <path d="M75 165 Q145 55 215 165 Z" fill="#4FA3B7" opacity="0.55" />
        <path d="M135 165 Q195 95 255 165 Z" fill="#2F5D50" opacity="0.65" />
        {storyId === 'seolmundae' && !isSecond && (
          <>
            <ellipse cx="145" cy="74" rx="22" ry="8" fill="#FFFDF7" />
            <circle cx="72" cy="148" r="10" fill="#2F5D50" opacity="0.5" />
            <circle cx="212" cy="152" r="12" fill="#2F5D50" opacity="0.5" />
          </>
        )}
        {storyId === 'seolmundae' && isSecond && (
          <path d="M105 115 C105 150, 175 150, 175 115 Z" fill="#2F5D50" />
        )}
        {storyId === 'samsinin' && (
          <>
            <line x1="95" y1="135" x2="125" y2="65" stroke="#2F5D50" strokeWidth="4" strokeLinecap="round" />
            <line x1="140" y1="135" x2="140" y2="55" stroke="#2F5D50" strokeWidth="4" strokeLinecap="round" />
            <line x1="185" y1="135" x2="155" y2="65" stroke="#2F5D50" strokeWidth="4" strokeLinecap="round" />
          </>
        )}
        {storyId === 'honinji' && (
          <rect x="112" y="105" width="56" height="36" rx="8" fill="#FFFDF7" stroke="#2F5D50" strokeWidth="3" />
        )}
        {storyId === 'jacheongbi' && (
          <>
            <circle cx="122" cy="112" r="7" fill="#F28C28" />
            <circle cx="140" cy="105" r="8" fill="#FFFDF7" />
            <circle cx="158" cy="112" r="7" fill="#2F5D50" />
          </>
        )}
        {storyId === 'suwolbong' && (
          <path d="M140 68 C140 68, 122 98, 122 112 A18 18 0 0 0 158 112 C158 98, 140 68, 140 68 Z" fill="#4FA3B7" />
        )}
        {storyId === 'sanbangdeok' && (
          <path d="M118 165 C118 122, 162 122, 162 165 Z" fill="#FFFDF7" />
        )}
        {storyId === 'yeongdeung' && (
          <path d="M55 78 C95 55, 145 95, 205 68" fill="none" stroke="#2F5D50" strokeWidth="4" strokeLinecap="round" />
        )}
        <path d="M16 165 H264" stroke="#2F5D50" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
      </svg>
    </div>
  )
}

// 선택한 신화의 이야기 + 이미지 영역 — 표현 전용.
// 기존 StoryDetail 호환을 유지하면서, 홈 화면에서는 학생 눈높이 2~3문장 장면 구성과 파스텔 그림책 뷰를 지원한다.
export default function StoryPanel({
  storyId,
  title,
  question,
  scene,
  source,
  preview,
  sceneIndex = 0,
  sceneCount = 1,
  onSceneChange,
  placeBridge,
  preferPastelArt = false,
  hasQuizPuzzle = false,
}) {
  const [showOriginalArt, setShowOriginalArt] = useState(false)
  const image = scene?.image
  const archiveImage = scene?.archiveImage
  const displayedImage = showOriginalArt && archiveImage ? archiveImage : image
  const text = scene?.text
  const lines = scene?.studentLines
  const isLastScene = sceneIndex >= Math.max(sceneCount, 1) - 1

  return (
    <article className="story-panel surface">
      <div className="story-figure" key={`fig-${storyId || title}-${scene?.id ?? sceneIndex}`}>
        <div className="story-figure-top">
          <span className="story-step-pill">
            📖 장면 {sceneIndex + 1} / {Math.max(sceneCount, 1)}
          </span>
          {preferPastelArt && archiveImage && (
            <button
              type="button"
              className="btn-archive-toggle"
              onClick={() => setShowOriginalArt((v) => !v)}
            >
              {showOriginalArt ? '🎨 픽셀 그림 보기' : '🖼️ 공공데이터 원본 삽화 보기'}
            </button>
          )}
        </div>

        <div className="story-figure-frame">
          {displayedImage ? (
            <img
              className={displayedImage === image ? 'story-pixel-art' : 'story-archive-art'}
              src={displayedImage.src}
              alt={displayedImage.alt}
              width={displayedImage.width}
              height={displayedImage.height}
              loading="lazy"
            />
          ) : (
            <ScenePastelArt storyId={storyId} sceneIndex={sceneIndex} />
          )}
        </div>

        {scene?.termTip && (
          <div className="story-term-tip">
            <span className="term-tip-badge">💡 쉬운 용어 풀이</span>
            <span>{scene.termTip}</span>
          </div>
        )}
      </div>

      <div className="story-copy" key={`copy-${storyId || title}-${scene?.id ?? sceneIndex}`}>
        <div className="d-flex flex-wrap gap-2 align-items-center mb-1">
          {scene?.caption && <span className="story-caption">{scene.caption}</span>}
          {preview && !lines && <span className="preview-badge">예시 데이터</span>}
        </div>

        <h3 className="story-heading mt-1 mb-1">{title}</h3>
        {question && <p className="story-question-sub mb-3">{question}</p>}

        {Array.isArray(lines) && lines.length > 0 ? (
          <div className="story-easy-lines">
            {lines.map((sentence, idx) => (
              <p key={idx} className="story-easy-p">
                {sentence}
              </p>
            ))}
          </div>
        ) : text ? (
          <p className="story-text">{text}</p>
        ) : (
          <div className="story-empty">
            <i className="bi bi-journal-text me-2" />
            이 이야기의 본문은 출처 확인 후 표시됩니다.
          </div>
        )}

        <SceneNav index={sceneIndex} total={sceneCount} onChange={onSceneChange} />

        {hasQuizPuzzle && (
          <div className={`story-puzzle-callout mt-3 ${isLastScene ? 'is-ready' : ''}`}>
            <div>
              <span className="story-puzzle-callout-badge">
                {isLastScene ? '🧩 마지막 장면까지 다 읽었어요!' : '🧩 신화 그림 퍼즐 챌린지'}
              </span>
              <p className="story-puzzle-callout-text mb-0">
                {isLastScene
                  ? `이제 아래 3지선다 퀴즈를 풀고 가려진 ${title} 삽화 3조각을 완성해 보세요!`
                  : '2장면까지 모두 읽은 뒤, 아래 퀴즈 3문제를 맞히면 가려진 신화 삽화가 완성돼요.'}
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {!isLastScene && onSceneChange && (
                <button
                  type="button"
                  className="btn btn-outline-sea btn-sm btn-round"
                  onClick={() => onSceneChange(sceneCount - 1)}
                >
                  2장면 이어서 읽기 →
                </button>
              )}
              <a href="#myth-quiz-puzzle" className="btn btn-primary btn-sm btn-round">
                🧩 퀴즈 풀고 퍼즐 맞추기 ↓
              </a>
            </div>
          </div>
        )}

        {placeBridge && (
          <div className="story-place-bridge mt-3">
            <div className="story-place-row">
              <div>
                <span className="story-place-label">🧭 신화 속 진짜 장소 탐험</span>
                <strong className="story-place-name d-block">{placeBridge.placeName}</strong>
                <p className="story-place-summary mb-0">{placeBridge.summary}</p>
              </div>
              <div className="story-place-btns">
                {placeBridge.hasPlace !== false && (
                  <Link to="/places" className="btn btn-outline-sea btn-sm">
                    <i className="bi bi-geo-alt me-1" />장소 찾아보기
                  </Link>
                )}
                <Link to="/agent" className="btn btn-primary btn-sm">
                  <i className="bi bi-chat-dots me-1" />AI에게 질문하기
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="story-credit-bar">
          <SourceCredit source={source} />
          {preferPastelArt && (
            <p className="source-distinction mb-0">
              · 카드와 장면 그림: Gemini 제작 2D 픽셀 아트 · 이야기 근거: Gemini 공공데이터 교차 검증 완료
              {archiveImage ? ' · 공식 원본 삽화는 버튼으로 따로 볼 수 있어요.' : ''}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
