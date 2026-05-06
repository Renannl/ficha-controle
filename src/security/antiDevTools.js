// ═══════════════════════════════════════════════════════════════
//  Anti-DevTools · Proteção contra inspeção do código-fonte
//  Ativo apenas quando VITE_DISABLE_DEVTOOLS=true
// ═══════════════════════════════════════════════════════════════

const IS_PRODUCTION = import.meta.env.PROD
const DEVTOOLS_DISABLED = import.meta.env.VITE_DISABLE_DEVTOOLS === 'true'

// Só ativa proteções em produção OU quando explicitamente habilitado
const SHOULD_PROTECT = IS_PRODUCTION || DEVTOOLS_DISABLED

// ─── 1. Bloquear atalhos de teclado do DevTools ───
function blockDevToolsKeys() {
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element Picker)
    if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Ctrl+U (View Source)
    if (e.ctrlKey && e.key.toUpperCase() === 'U') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Ctrl+S (Save Page)
    if (e.ctrlKey && e.key.toUpperCase() === 'S') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Ctrl+Shift+K (Firefox console)
    if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'K') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }, { capture: true })
}

// ─── 2. Bloquear clique direito (menu de contexto) ───
function blockContextMenu() {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  }, { capture: true })
}

// ─── 3. Detectar DevTools aberto via debugger timing ───
function detectDevToolsDebugger() {
  let devToolsOpen = false

  function check() {
    const start = performance.now()
    // eslint-disable-next-line no-debugger
    debugger
    const end = performance.now()

    // Se levou mais de 100ms, o debugger está ativo
    if (end - start > 100) {
      if (!devToolsOpen) {
        devToolsOpen = true
        handleDevToolsDetected()
      }
    } else {
      devToolsOpen = false
    }
  }

  // Verificar a cada 2 segundos
  setInterval(check, 2000)
}

// ─── 4. Detectar DevTools via tamanho da janela ───
function detectDevToolsResize() {
  const threshold = 160

  function check() {
    const widthDiff = window.outerWidth - window.innerWidth
    const heightDiff = window.outerHeight - window.innerHeight

    if (widthDiff > threshold || heightDiff > threshold) {
      handleDevToolsDetected()
    }
  }

  window.addEventListener('resize', check)
  // Verificação inicial
  check()
}

// ─── 5. Limpar console ───
function clearConsole() {
  const noop = () => {}

  // Guarda referências originais para uso interno se necessário
  const _origConsole = { ...console }
  void _origConsole // evita warning de variável não usada

  // Sobrescreve métodos do console
  const methods = ['log', 'warn', 'error', 'info', 'debug', 'table', 'trace', 'dir', 'dirxml', 'group', 'groupEnd', 'groupCollapsed', 'time', 'timeEnd', 'timeLog', 'profile', 'profileEnd', 'assert', 'count', 'countReset']

  methods.forEach(method => {
    try {
      console[method] = noop
    } catch {}
  })

  // Limpa o console periodicamente
  setInterval(() => {
    try { console.clear() } catch {}
  }, 1000)
}

// ─── 6. Bloquear arrastar (drag) de elementos ───
function blockDrag() {
  document.addEventListener('dragstart', (e) => {
    e.preventDefault()
    return false
  })

  document.addEventListener('drop', (e) => {
    e.preventDefault()
    return false
  })
}

// ─── 7. Bloquear seleção de texto (proteção de conteúdo) ───
function blockTextSelection() {
  const style = document.createElement('style')
  style.textContent = `
    * {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
    }
    input, textarea, [contenteditable="true"] {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }
  `
  document.head.appendChild(style)
}

// ─── Handler quando DevTools é detectado ───
function handleDevToolsDetected() {
  // Pode adicionar ação como redirecionar, mostrar aviso, etc.
  // Por enquanto, só limpa o conteúdo da página
  try {
    document.title = '⚠ Acesso restrito'
  } catch {}
}

// ─── Inicialização ───
export function initAntiDevTools() {
  if (!SHOULD_PROTECT) {
    console.log('[Security] Anti-DevTools desativado no modo desenvolvimento')
    return
  }

  blockDevToolsKeys()
  blockContextMenu()
  blockDrag()
  blockTextSelection()
  clearConsole()

  // Detecções mais agressivas — só em produção
  if (IS_PRODUCTION) {
    detectDevToolsDebugger()
    detectDevToolsResize()
  }
}
