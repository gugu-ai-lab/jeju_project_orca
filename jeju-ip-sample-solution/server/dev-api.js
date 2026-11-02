import { loadEnv } from 'vite'
import { resolve } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
export function localApi() {
  return {
    name: 'local-server-functions',
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.envDir, '')
      const localPath = resolve(server.config.envDir, '.env.local')
      const local = existsSync(localPath) ? parseEnv(readFileSync(localPath, 'utf8')) : {}
      for (const name of ['DATA_GO_KR_KEY', 'OPENAI_API_KEY']) {
        // 빈 로컬 설정도 존중: 코딩 CLI에서 상속된 런타임 키를 대신 사용하지 않는다.
        if (Object.hasOwn(local, name)) process.env[name] = local[name]
        else if (name === 'OPENAI_API_KEY') process.env[name] = ''
        else if (process.env[name] === undefined && env[name] !== undefined) process.env[name] = env[name]
      }
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        const name = url.pathname.match(/^\/api\/(agent|tools|hello|tour|heritage|weather)$/)?.[1]
        if (!name) return next()
        res.status = code => { res.statusCode = code; return res }
        res.json = data => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(data)) }
        req.query = Object.fromEntries(url.searchParams)
        try {
          if (req.method === 'POST') {
            let body = ''
            for await (const chunk of req) {
              body += chunk
              if (Buffer.byteLength(body) > 65536) return res.status(413).json({ error: '요청이 너무 큽니다.' })
            }
            try { req.body = JSON.parse(body) } catch { return res.status(400).json({ error: '올바른 JSON 요청이 필요합니다.' }) }
          }
          const handler = (await server.ssrLoadModule('/api/' + name + '.js')).default
          await handler(req, res)
        } catch { res.status(500).json({ error: '서버 요청을 처리하지 못했습니다.' }) }
      })
    },
  }
}
