import { existsSync } from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'

const joinUrl = (baseUrl: string | undefined, path: string) => `${(baseUrl || '').replace(/\/$/, '')}/${path}`
const isLocalUrl = (url: string | undefined) => /^https?:\/\/(localhost|127\.0\.0\.1)(?::|\/|$)/.test(url || '')

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const sharedEnvDir = fileURLToPath(new URL('..', import.meta.url))
  const envDir = fileURLToPath(new URL(mode === 'prod' || mode === 'production' ? '.' : '..', import.meta.url))
  const env = { ...loadEnv(mode, sharedEnvDir, ''), ...loadEnv(mode, envDir, '') }
  const studioUrl =
    mode === 'prod' && isLocalUrl(env.VITE_WRISTO_STUDIO_URL)
      ? 'https://studio.wristo.io'
      : env.VITE_WRISTO_STUDIO_URL || 'https://studio.wristo.io'

  return {
    envDir,
    define: {
      'import.meta.env.VITE_WRISTO_SSO_REDIRECT_URI': JSON.stringify(env.VITE_WRISTO_STORE_SSO_REDIRECT_URI || ''),
      'import.meta.env.VITE_WRISTO_SSO_LOGIN_URL': JSON.stringify(joinUrl(env.VITE_WRISTO_SSO_URL, 'login')),
      'import.meta.env.VITE_WRISTO_SSO_SIGNUP_URL': JSON.stringify(joinUrl(env.VITE_WRISTO_SSO_URL, 'register')),
      'import.meta.env.VITE_WRISTO_GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_WRISTO_GOOGLE_CLIENT_ID || ''),
      'import.meta.env.VITE_WRISTO_PADDLE_ENVIRONMENT': JSON.stringify(env.VITE_WRISTO_PADDLE_ENVIRONMENT || ''),
      'import.meta.env.VITE_WRISTO_PADDLE_CLIENT_TOKEN': JSON.stringify(env.VITE_WRISTO_PADDLE_CLIENT_TOKEN || ''),
      'import.meta.env.VITE_WRISTO_SITE_URL': JSON.stringify(env.VITE_WRISTO_STORE_URL || ''),
      'import.meta.env.VITE_WRISTO_STUDIO_URL': JSON.stringify(studioUrl),
      'import.meta.env.VITE_WRISTO_STUDIO_PADDLE_PRICE_MONTHLY': JSON.stringify(env.VITE_WRISTO_STUDIO_PADDLE_PRICE_MONTHLY || ''),
      'import.meta.env.VITE_WRISTO_STUDIO_PADDLE_PRICE_QUARTERLY': JSON.stringify(env.VITE_WRISTO_STUDIO_PADDLE_PRICE_QUARTERLY || ''),
      'import.meta.env.VITE_WRISTO_STUDIO_PADDLE_PRICE_SEMIANNUAL': JSON.stringify(env.VITE_WRISTO_STUDIO_PADDLE_PRICE_SEMIANNUAL || ''),
      'import.meta.env.VITE_WRISTO_STUDIO_PADDLE_PRICE_ANNUAL': JSON.stringify(env.VITE_WRISTO_STUDIO_PADDLE_PRICE_ANNUAL || ''),
      'import.meta.env.VITE_WRISTO_STUDIO_PADDLE_PRICE_PREMIUM_30D': JSON.stringify(env.VITE_WRISTO_STUDIO_PADDLE_PRICE_PREMIUM_30D || ''),
      'import.meta.env.VITE_STORE_CART_ENABLED': JSON.stringify(env.VITE_STORE_CART_ENABLED || ''),
    },
    plugins: [
      vue(),
      {
        name: 'store-spa-shell',
        enforce: 'post',
        configurePreviewServer(server) {
          // Match filesystem-first production routing, including extensionless directory URLs.
          server.middlewares.use((request, _response, next) => {
            const url = new URL(request.url || '/', 'http://localhost')
            const root = path.resolve(server.config.root, server.config.build.outDir)
            const candidate = path.resolve(root, `.${url.pathname}`, 'index.html')
            if (candidate.startsWith(`${root}${path.sep}`) && existsSync(candidate)) {
              request.url = `${url.pathname.replace(/\/$/, '')}/index.html${url.search}`
            } else if (!path.extname(url.pathname) && request.headers.accept?.includes('text/html')) {
              request.url = `/app.html${url.search}`
            }
            next()
          })
        },
        generateBundle(_options, bundle) {
          const html = bundle['index.html']
          if (html?.type === 'asset') this.emitFile({ type: 'asset', fileName: 'app.html', source: html.source })
        },
      }
    ],
    base: '/', // Ensure base URL is set to root
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: true, // 监听所有地址
      port: 3000,
      proxy: {
        '^/api/.*': {
          target: 'http://localhost:8088',
          // target:  'https://api.wristo.io',
          changeOrigin: true,
          secure: false,
          // rewrite: (path) => path.replace(/^\/api/, ''),
        }
      },
    },
  }
})
