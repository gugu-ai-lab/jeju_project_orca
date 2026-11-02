import StoryFavoriteButton from '../components/StoryFavoriteButton'
import { useLayoutEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import StoryPanel from '../components/StoryPanel'
import MythQuizPuzzleSection from '../components/puzzle/MythQuizPuzzleSection'
import { getMythQuizPuzzle } from '../data/mythQuizPuzzles'
import { STORY_CATALOG } from '../data/storyCatalog'
import { CATEGORY_LABEL, isVerified } from '../lib/storyFilter'

// 이야기 상세 — /explore/:storyId. 카탈로그에 있는 항목만 보여주고, 없으면 안내한다.
export default function StoryDetail() {
  const { storyId } = useParams()
  return <StoryDetailContent key={storyId} storyId={storyId} />
}
function StoryDetailContent({ storyId }) {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [storyId])

  const story = STORY_CATALOG.find((s) => s.id === storyId)
  const [sceneIndex, setSceneIndex] = useState(0)
  const hasQuizPuzzle = Boolean(story && getMythQuizPuzzle(story.id))

  return (
    <>
      <Link to="/explore" className="btn btn-outline-sea btn-sm mb-3"><i className="bi bi-arrow-left me-1" />이야기 목록</Link>
      {!story ? (
        <div className="story-empty"><i className="bi bi-question-circle me-2" />찾을 수 없는 이야기입니다. 목록에서 다시 골라 주세요.</div>
      ) : (
        <>
          <div className="d-flex flex-wrap gap-2 mb-2">
            <span className="chip">{CATEGORY_LABEL[story.category]}</span>
            <span className={`chip ${isVerified(story) ? 'chip-ok' : 'chip-wait'}`}>{isVerified(story) ? '출처 확인됨' : '출처 검증 대기'}</span>
            {story.place && <span className="chip"><i className="bi bi-geo-alt me-1" />{story.place}</span>}
          </div>
          <StoryPanel
            storyId={story.id}
            title={story.title}
            question={story.question}
            placeBridge={story.placeBridge}
            scene={story.scenes[sceneIndex]}
            source={story.source}
            sceneIndex={sceneIndex}
            sceneCount={story.scenes.length}
            onSceneChange={setSceneIndex}
            hasQuizPuzzle={hasQuizPuzzle}
          />
          <StoryFavoriteButton storyId={story.id} storyTitle={story.title} />
          {hasQuizPuzzle && (
            <MythQuizPuzzleSection
              key={story.id}
              storyId={story.id}
              storyTitle={story.title}
            />
          )}
        </>
      )}
    </>
  )
}
