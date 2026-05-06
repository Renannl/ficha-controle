// ═══════════════════════════════════════════════════════════════
//  Network Guard · Proteção de rede no lado do cliente
//  Valida origens, bloqueia requests externos, monitora injeções
// ═══════════════════════════════════════════════════════════════

const ALLOWED_ORIGINS = (import.meta.env.VITE_APP_ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

const RESTRICT_INTERNAL = import.meta.env.VITE_RESTRICT_INTERNAL_NETWORK === 'true'

// ─── Padrão de IPs de rede privada ───
const PRIVATE_IP_REGEX = /^(https?:\/\/)?(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|::1|\[::1\])/i

// ─── 1. Validar origem da página ───
function validateOrigin() {
  const currentOrigin = window.location.origin

  // Permitir file:// para desenvolvimento
  if (currentOrigin === 'null' || window.location.protocol === 'file:') {
    return true
  }

  // Verificar se a origem é de rede interna
  if (RESTRICT_INTERNAL && !PRIVATE_IP_REGEX.test(currentOrigin)) {
    console.error('[NetworkGuard] Acesso bloqueado: origem externa detectada')
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;
           background:#0a0f1e;color:#EF5350;font-family:Inter,sans-serif;text-align:center;padding:20px;">
        <div>
          <h1 style="font-size:24px;margin-bottom:12px;">⚠ Acesso Restrito</h1>
          <p style="color:#7A8FA6;font-size:14px;">Este aplicativo só pode ser acessado na rede interna.</p>
          <p style="color:#3D5070;font-size:12px;margin-top:8px;">Origem: ${currentOrigin}</p>
        </div>
      </div>
    `
    return false
  }

  // Verificar lista de origens permitidas (se definidas)
  if (ALLOWED_ORIGINS.length > 0) {
    const isAllowed = ALLOWED_ORIGINS.some(origin => currentOrigin.startsWith(origin.replace(/\/+$/, '')))

    // Também permitir qualquer IP privado
    const isPrivate = PRIVATE_IP_REGEX.test(currentOrigin)

    if (!isAllowed && !isPrivate) {
      console.warn('[NetworkGuard] Origem não listada, mas permitida por ser rede interna:', currentOrigin)
    }
  }

  return true
}

// ─── 2. Interceptar fetch para bloquear requests externos ───
function guardFetch() {
  const originalFetch = window.fetch

  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input)

    // Permitir URLs relativas
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return originalFetch.call(this, input, init)
    }

    // Permitir data: e blob:
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      return originalFetch.call(this, input, init)
    }

    // Verificar se é rede interna
    if (RESTRICT_INTERNAL && !PRIVATE_IP_REGEX.test(url)) {
      // Permitir resources autorizados (fonts e bibliotecas)
      if (
        url.includes('fonts.googleapis.com') || 
        url.includes('fonts.gstatic.com') ||
        url.includes('cdnjs.cloudflare.com')
      ) {
        return originalFetch.call(this, input, init)
      }

      console.error('[NetworkGuard] Fetch bloqueado para URL externa:', url)
      return Promise.reject(new Error('[NetworkGuard] Requests externos bloqueados'))
    }

    return originalFetch.call(this, input, init)
  }
}

// ─── 3. Interceptar XMLHttpRequest ───
function guardXHR() {
  const originalOpen = XMLHttpRequest.prototype.open

  XMLHttpRequest.prototype.open = function (method, url, ...args) {
    const urlStr = String(url)

    // Permitir URLs relativas
    if (urlStr.startsWith('/') || urlStr.startsWith('./') || urlStr.startsWith('../')) {
      return originalOpen.call(this, method, url, ...args)
    }

    // Verificar se é rede interna
    if (RESTRICT_INTERNAL && !PRIVATE_IP_REGEX.test(urlStr)) {
      // Permitir resources autorizados
      if (
        urlStr.includes('fonts.googleapis.com') || 
        urlStr.includes('fonts.gstatic.com') ||
        urlStr.includes('cdnjs.cloudflare.com')
      ) {
        return originalOpen.call(this, method, url, ...args)
      }

      console.error('[NetworkGuard] XHR bloqueado para URL externa:', urlStr)
      throw new Error('[NetworkGuard] Requests externos bloqueados')
    }

    return originalOpen.call(this, method, url, ...args)
  }
}

// ─── 4. Monitorar injeções de scripts externos ───
function watchScriptInjection() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'SCRIPT' && node.src) {
          const src = node.src

          // Permitir scripts locais, rede interna e bibliotecas autorizadas (CDN)
          if (
            src.startsWith(window.location.origin) || 
            PRIVATE_IP_REGEX.test(src) ||
            src.includes('cdnjs.cloudflare.com')
          ) {
            return
          }

          // Bloquear scripts externos
          console.error('[NetworkGuard] Script externo bloqueado:', src)
          node.remove()
        }
      })
    })
  })

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  })
}

// ─── 5. Bloquear WebSocket para externos ───
function guardWebSocket() {
  const OriginalWebSocket = window.WebSocket

  window.WebSocket = function (url, protocols) {
    const urlStr = String(url)

    if (RESTRICT_INTERNAL && !PRIVATE_IP_REGEX.test(urlStr) && !urlStr.includes('localhost')) {
      console.error('[NetworkGuard] WebSocket externo bloqueado:', urlStr)
      throw new Error('[NetworkGuard] WebSocket externo bloqueado')
    }

    return new OriginalWebSocket(url, protocols)
  }

  // Manter prototype
  window.WebSocket.prototype = OriginalWebSocket.prototype
  window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING
  window.WebSocket.OPEN = OriginalWebSocket.OPEN
  window.WebSocket.CLOSING = OriginalWebSocket.CLOSING
  window.WebSocket.CLOSED = OriginalWebSocket.CLOSED
}

// ─── Inicialização ───
export function initNetworkGuard() {
  // Validar origem primeiro
  const originValid = validateOrigin()
  if (!originValid) return

  // Ativar guardas
  guardFetch()
  guardXHR()
  watchScriptInjection()

  // WebSocket guard — desabilita em dev para não quebrar HMR do Vite
  if (import.meta.env.PROD) {
    guardWebSocket()
  }

  // Log de segurança (só em dev)
  if (import.meta.env.DEV) {
    console.log('[NetworkGuard] ✅ Proteções de rede ativadas')
    console.log('[NetworkGuard] Origens permitidas:', ALLOWED_ORIGINS)
    console.log('[NetworkGuard] Restrito à rede interna:', RESTRICT_INTERNAL)
  }
}
