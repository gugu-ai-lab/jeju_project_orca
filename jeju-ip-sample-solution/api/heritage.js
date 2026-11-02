import { getHeritageDetail, searchHeritagePage } from '../server/heritage.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET 요청만 지원합니다.' })
  try {
    if (req.query.ccbaKdcd || req.query.ccbaAsno || req.query.ccbaCtcd) {
      const detail = await getHeritageDetail(req.query)
      return detail ? res.status(200).json(detail) : res.status(404).json({ error: '상세 정보를 찾지 못했습니다.' })
    }
    return res.status(200).json(await searchHeritagePage({ keyword: req.query.keyword || '', pageNo: req.query.page || '1', rows: req.query.rows || '9' }))
  } catch (e) {
    return res.status(e.message === 'INVALID_HERITAGE_ID' || e.message === 'INVALID_HERITAGE_QUERY' ? 400 : 500).json({ error: e.message === 'INVALID_HERITAGE_ID' ? '유산 식별 정보가 올바르지 않습니다.' : e.message === 'INVALID_HERITAGE_QUERY' ? '검색 조건이 올바르지 않습니다.' : '국가유산 정보를 조회하지 못했습니다.' })
  }
}
