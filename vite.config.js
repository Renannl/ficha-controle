import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const HOST = env.VITE_APP_HOST || '0.0.0.0'
  const PORT = parseInt(env.VITE_APP_PORT || '5173', 10)

  // ─── Headers de Segurança ───
  const securityHeaders = {
    'X-Content-Type-Options': env.VITE_SECURITY_NO_SNIFF || 'nosniff',
    'X-Frame-Options': env.VITE_SECURITY_FRAME_OPTIONS || 'DENY',
    'X-XSS-Protection': env.VITE_SECURITY_XSS_PROTECTION || '1; mode=block',
    'Referrer-Policy': env.VITE_SECURITY_REFERRER_POLICY || 'strict-origin-when-cross-origin',
    'Permissions-Policy': env.VITE_SECURITY_PERMISSIONS_POLICY || 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()',
    'X-DNS-Prefetch-Control': 'off',
    'X-Download-Options': 'noopen',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Strict-Transport-Security': env.VITE_SECURITY_HSTS || 'max-age=31536000; includeSubDomains; preload', // Força requisição HTTPS (certificado)
  }

  return {
    plugins: [
      mkcert(),
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: env.VITE_APP_NAME || 'Ficha de Controle – IndusPower',
          short_name: 'Ficha Controle',
          description: 'Sistema de fichas de inspeção e controle IndusPower',
          theme_color: '#1565C0',
          background_color: '#0a0f1e',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
          ]
        }
      })
    ],

    // ─── Servidor de Desenvolvimento ───
    server: {
      host: HOST,
      port: PORT,
      strictPort: true,
      // Bloqueia acesso de origens não autorizadas
      cors: {
        origin: (env.VITE_APP_ALLOWED_ORIGINS || '')
          .split(',')
          .map(o => o.trim())
          .filter(Boolean),
        credentials: false,
      },
      headers: securityHeaders,
      // HMR dinâmico (permite Live Reload em celular e PC)
      hmr: true,
    },

    // ─── Preview (produção local) ───
    preview: {
      host: HOST,
      port: PORT + 1,
      strictPort: true,
      headers: securityHeaders,
    },

    // ─── Build ───
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          // Ofusca nomes de chunks
          chunkFileNames: 'assets/[hash].js',
          entryFileNames: 'assets/[hash].js',
          assetFileNames: 'assets/[hash].[ext]',
        },
      },
    },

    // ─── Variáveis de ambiente ───
    envPrefix: 'VITE_',
  }
})
