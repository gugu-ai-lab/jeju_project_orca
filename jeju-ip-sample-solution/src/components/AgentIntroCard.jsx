import { Link } from 'react-router-dom'

// 홈에서 실제 AI 대화로 이동하기 위한 소개 카드. 대화나 API 호출은 여기서 하지 않는다.
export default function AgentIntroCard() {
  return (
    <section className="agent-intro-card surface mt-4 p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3" aria-labelledby="agent-intro-title">
      <div>
        <span className="hero-cute-badge">🌙 제주 신화 안내원</span>
        <h2 id="agent-intro-title" className="h4 mt-2 mb-1">신화 속 궁금한 점을 물어보세요</h2>
        <p className="mb-0">제주 신화와 역사문화 자료를 바탕으로 AI 안내원이 이야기를 찾아 설명해 드려요.</p>
      </div>
      <Link to="/agent" className="btn btn-primary btn-round flex-shrink-0">AI 안내원에게 질문하기</Link>
    </section>
  )
}
