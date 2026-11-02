import { searchTour } from '../server/tour.js'
import { safeErrors } from '../server/myth-tools.js'
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET 요청만 지원합니다.' })
  try {
    const { keyword = '', type = '12' } = req.query
    return res.status(200).json(await searchTour({ keyword, contentTypeId: type }))
  } catch (error) {
    return res.status(error.message === 'INVALID_TOOL_INPUT' ? 400 : 503).json({
      error: safeErrors[error.message] || '관광정보 조회에 실패했습니다.',
      upstreamCode: error.upstreamCode, httpStatus: error.httpStatus,
    })
  }
}
