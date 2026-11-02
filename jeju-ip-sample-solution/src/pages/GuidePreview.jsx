import { Navigate } from 'react-router-dom'

// 예전 미리보기 주소는 실제 AI 가이드로 연결한다. 별도의 모의 대화는 제공하지 않는다.
export default function GuidePreview() {
  return <Navigate to="/agent" replace />
}
