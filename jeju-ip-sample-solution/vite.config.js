import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { localApi } from './server/dev-api.js'

// 배포는 api/ 서버 함수를 사용하고 로컬은 동일 핸들러를 실행한다.
export default defineConfig({ plugins: [react(), localApi()] })
