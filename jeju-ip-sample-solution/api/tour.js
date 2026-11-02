import { getTourDetail, searchTourPage } from '../server/tour.js'
import { safeErrors } from '../server/myth-tools.js'
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET 요청만 지원합니다.' })
  try {
    if (req.query.contentId !== undefined) {
      const detail = await getTourDetail({ contentId: req.query.contentId })
      return detail ? res.status(200).json(detail) : res.status(404).json({ error: '상세 정보를 찾지 못했습니다.' })
    }
    const { keyword = '', type = '', page = '1', rows = '9' } = req.query
    return res.status(200).json(await searchTourPage({ keyword, contentTypeId: type, pageNo: page, rows }))
  } catch (error) {
    return res.status(error.message === 'INVALID_TOOL_INPUT' ? 400 : 503).json({
      error: safeErrors[error.message] || '관광정보 조회에 실패했습니다.',
      upstreamCode: error.upstreamCode, httpStatus: error.httpStatus,
    })
  }
}
