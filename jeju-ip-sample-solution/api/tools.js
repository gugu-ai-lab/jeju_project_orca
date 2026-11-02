import { catalog, executeTool, safeErrors } from '../server/myth-tools.js'
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'GET') return res.status(200).json({ tools: catalog() })
  if (req.method !== 'POST') return res.status(405).json({ error: '지원하지 않는 요청입니다.' })
  try {
    const { tool, input } = req.body || {}
    return res.status(200).json(await executeTool(tool, input))
  } catch (error) {
    const code = safeErrors[error.message] ? error.message : 'UPSTREAM_UNAVAILABLE'
    return res.status(['INVALID_TOOL_INPUT', 'UNKNOWN_TOOL'].includes(code) ? 400 : 503).json({ code, error: safeErrors[code], upstreamCode: error.upstreamCode, httpStatus: error.httpStatus })
  }
}
