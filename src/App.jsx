import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useFichas } from './hooks/useFichas'
import { OPERACOES, getChecklistItems } from './data/fichaTemplate'
import LoginScreen from './components/LoginScreen'
import Header from './components/Header'
import InfoCard from './components/InfoCard'
import ChecklistTable from './components/ChecklistTable'
import SessionsPanel from './components/SessionsPanel'
import NotesSection from './components/NotesSection'
import SignatureSection from './components/SignatureSection'
import HomeScreen from './components/HomeScreen'
import PrintView from './components/PrintView'
import TafPanel from './components/TafPanel'
import PhotoPanel from './components/PhotoPanel'
import ConsideracoesPanel from './components/ConsideracoesPanel'
import AdminPanel from './components/AdminPanel'
import ConfirmModal from './components/ConfirmModal'
import RejectModal from './components/RejectModal'
import { exportFicha } from './services/sharepointService'
import './App-v2.css'
import { testSupabase } from './testSupabase'

export default function App() {
  const { user, isAuthenticated, login, logout } = useAuth()
  const { fichas, isLoading, criarFicha, atualizarFicha, excluirFicha, getFicha } = useFichas(user)
  const [currentFichaId, setCurrentFichaId] = useState(() => localStorage.getItem('currentFichaId') || null)
  const [activeTab, setActiveTab ] = useState(() => localStorage.getItem('activeTab') || 'info')
  const [showAdmin, setShowAdmin] = useState(() => localStorage.getItem('showAdmin') === 'true')

  useEffect(() => {
    localStorage.setItem('showAdmin', showAdmin)
  }, [showAdmin])

  useEffect(() => {
    testSupabase()
  }, [])

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab)
  }, [activeTab])
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' })
  const [rejectInfo, setRejectInfo] = useState(null)
  
  const ficha = currentFichaId ? getFicha(currentFichaId) : null

  // ─── LOADING ───
  if (isLoading) {
    return (
      <div className="loading-screen" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', gap: '16px'
      }}>
        <div className="login-spinner" />
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Desencriptando dados seguros...</p>
      </div>
    )
  }

  // ─── LOGIN ───
  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} />
  }

  function handleNova(operacaoCodigo) {
    const id = criarFicha(operacaoCodigo)
    setCurrentFichaId(id)
    // Se for TAF (50), abre direto em testes, senão em dados
    setActiveTab(operacaoCodigo === '50' ? 'taf' : 'info')
  }

  function handleApprove(id, estado) {
    if (estado === 'reprovado') {
      setRejectInfo({ id })
    } else {
      atualizarFicha(id, { statusAprovacao: estado })
    }
  }

  function confirmReject(reason) {
    if (!rejectInfo) return
    atualizarFicha(rejectInfo.id, {
      statusAprovacao: 'reprovado',
      status: 'andamento', 
      motivoReprovacao: reason
    })
    setRejectInfo(null)
  }

  function handleOpen(id) {
    const f = getFicha(id)
    setCurrentFichaId(id)
    setActiveTab(f?.tafData ? 'taf' : 'info')
  }

  function handleBack() {
    setCurrentFichaId(null)
    setActiveTab('info')
  }

  function handleDelete(id) {
    excluirFicha(id)
    if (currentFichaId === id) {
      setCurrentFichaId(null)
    }
  }

  function updateField(field, value) {
    atualizarFicha(currentFichaId, prev => ({ ...prev, [field]: value }))
  }

  function handleOperacaoChange(novoCodigo) {
    const op = OPERACOES[novoCodigo]
    if (!op) return

    atualizarFicha(currentFichaId, prev => ({
      ...prev,
      operacao: novoCodigo,
      equipe: op.equipe,
      objetivo: op.objetivo,
      items: op.items.map(item => ({
        id:           item.id,
        sessionMarks: Array(15).fill(''),
        resultado:    '',
      })),
    }))
  }

  function updateItem(itemIndex, key, value) {
    atualizarFicha(currentFichaId, prev => {
      const items = [...prev.items]
      items[itemIndex] = { ...items[itemIndex], [key]: value }
      return { ...prev, items }
    })
  }

  function updateItemSessionMark(itemIndex, sessionIndex, value) {
    atualizarFicha(currentFichaId, prev => {
      const items = [...prev.items]
      const marks = [...items[itemIndex].sessionMarks]
      marks[sessionIndex] = marks[sessionIndex] === value ? '' : value
      items[itemIndex] = { ...items[itemIndex], sessionMarks: marks }
      return { ...prev, items }
    })
  }

  function updateSession(sessionIndex, field, value) {
    atualizarFicha(currentFichaId, prev => {
      const sessions = [...prev.sessions]
      sessions[sessionIndex] = { ...sessions[sessionIndex], [field]: value }
      return { ...prev, sessions }
    })
  }

  function updateSignature(role, dataUrl) {
    atualizarFicha(currentFichaId, prev => ({
      ...prev,
      assinaturas: {
        ...prev.assinaturas,
        [role]: {
          ...prev.assinaturas[role],
          dataUrl,
          data: dataUrl ? new Date().toLocaleDateString('pt-BR') : '',
        },
      },
    }))
  }

  function updateSignatureName(role, nome) {
    atualizarFicha(currentFichaId, prev => ({
      ...prev,
      assinaturas: {
        ...prev.assinaturas,
        [role]: { ...prev.assinaturas[role], nome },
      },
    }))
  }

  async function handleFinalizar() {
    if (!ficha) return
    
    // Se a ficha já está finalizada, é obrigatório registrar as alterações feitas
    if ((ficha.status === 'finalizada' || ficha.statusAprovacao === 'reprovado') && (!ficha.alteracoesFeitas || !ficha.alteracoesFeitas.trim())) {
      alert("⚠️ Como esta ficha já foi avaliada ou finalizada antes, é obrigatório preencher o campo 'Alterações Feitas' na aba 'Notas' indicando o que foi modificado.")
      return
    }

    // 1. Atualizar status para finalizada e resetar aprovação para nova validação
    atualizarFicha(currentFichaId, {
      status: 'finalizada',
      statusAprovacao: 'aguardando',
      finalizadaAt: new Date().toISOString()
    })

    // 2. Pequeno delay para garantir que o React renderizou o novo estado no PrintView
    await new Promise(r => setTimeout(r, 500))

    // 3. Chamar o serviço de exportação (PDF + SharePoint Mock)
    const success = await exportFicha(ficha, 'print-view-root')

    if (success) {
      setSuccessModal({
        isOpen: true,
        title: 'Sucesso!',
        message: 'Ficha finalizada com sucesso! O PDF foi gerado e enviado para seus downloads.'
      })
    } else {
      setSuccessModal({
        isOpen: true,
        title: 'Erro',
        message: 'Houve um problema ao gerar o PDF. Verifique sua conexão ou tente novamente.',
        type: 'danger'
      })
    }
  }

  function getProgress() {
    if (!ficha) return 0
    const total = ficha.items.length
    const done = ficha.items.filter(i => i.resultado === 'ok' || i.resultado === 'na').length
    return Math.round((done / total) * 100)
  }

  // ─── HOME ───
  if (showAdmin && user?.role === 'admin') {
    return <AdminPanel onBack={() => setShowAdmin(false)} />
  }

  if (!ficha) {
    return (
      <div className="app">
        <HomeScreen
          fichas={fichas}
          onNova={handleNova}
          onOpen={handleOpen}
          onDelete={handleDelete}
          user={user}
          onLogout={logout}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenAdmin={() => setShowAdmin(true)}
          onApprove={handleApprove}
        />
      </div>
    )
  }

  // ─── FICHA ───
  const isTaf = !!ficha.tafData
  const isFoto = ficha.operacao === '80'

  const tabs = isTaf 
    ? [
        { id: 'taf',        icon: '⚡', label: 'Testes' },
        { id: 'checklist',  icon: '✅', label: 'Funcionais e Visuais' },
        { id: 'signatures', icon: '✍️', label: 'Assinaturas' },
      ]
    : isFoto
      ? [
          { id: 'info',       icon: '📋', label: 'Dados' },
          { id: 'fotos',      icon: '📸', label: 'Fotos' },
          { id: 'notes',      icon: '📝', label: 'Notas' },
        ]
      : [
          { id: 'info',       icon: '📋', label: 'Dados' },
          { id: 'checklist',  icon: '✅', label: 'Checklist' },
          { id: 'sessions',   icon: '🕐', label: 'Sessões' },
          { id: 'notes',      icon: '📝', label: 'Notas' },
          { id: 'signatures', icon: '✍️', label: 'Assinaturas' },
        ]

  const checklistItems = getChecklistItems(ficha.operacao)

  return (
    <>
    <div className="app">
      <Header
        ficha={ficha}
        user={user}
        progress={getProgress()}
        onBack={handleBack}
        onApprove={(estado) => handleApprove(currentFichaId, estado)}
      />

      <main className="main-content">
        {activeTab === 'info' && (!isFoto ? (
          <InfoCard
            ficha={ficha}
            onChange={updateField}
            onOperacaoChange={handleOperacaoChange}
          />
        ) : (
          <ConsideracoesPanel
            ficha={ficha}
            onUpdateHeader={updateField}
            onUpdateFotoData={(newData) => atualizarFicha(ficha.id, { fotoData: { ...ficha.fotoData, ...newData } })}
          />
        ))}
        {activeTab === 'checklist' && (
          <ChecklistTable
            ficha={ficha}
            checklistItems={checklistItems}
            onToggleMark={updateItemSessionMark}
            onSetResultado={(idx, val) => updateItem(idx, 'resultado', val)}
            isTaf={isTaf}
            tafData={ficha.tafData}
            onUpdateTaf={(newData) => atualizarFicha(ficha.id, { tafData: { ...ficha.tafData, ...newData } })}
          />
        )}
        {activeTab === 'taf' && isTaf && (
          <TafPanel
            ficha={ficha}
            onUpdate={(newData) => atualizarFicha(ficha.id, newData)}
          />
        )}
        {activeTab === 'fotos' && isFoto && (
          <PhotoPanel
            items={ficha.items}
            onUpdate={(idx, key, val) => updateItem(idx, key, val)}
          />
        )}
        {activeTab === 'sessions' && (
          <SessionsPanel
            sessions={ficha.sessions}
            onUpdate={updateSession}
          />
        )}
        {activeTab === 'notes' && (
          <NotesSection
            ficha={ficha}
            observacoes={ficha.observacoes}
            onChange={val => updateField('observacoes', val)}
            onChangeAlteracoes={val => updateField('alteracoesFeitas', val)}
            isFoto={isFoto}
            onFinalizar={handleFinalizar}
          />
        )}
        {activeTab === 'signatures' && (
          <SignatureSection
            assinaturas={ficha.assinaturas}
            onSign={updateSignature}
            onNameChange={updateSignatureName}
            onFinalizar={handleFinalizar}
          />
        )}
      </main>

      <nav className="tab-bar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
    
    {/* Camada Oculta Real de Impressão
        Colocada em uma div separada FORA da .app para garantir que o background
        da .app seja renderizado POR CIMA disto no DOM, mantendo-o invisível ao usuário,
        mas perfeitamente no topo e renderizável para o html2canvas. */}
    <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -9999 }}>
      <PrintView ficha={ficha} />
    </div>

    {/* Modal de Sucesso/Alerta Geral */}
    <ConfirmModal 
      isOpen={successModal.isOpen}
      title={successModal.title}
      message={successModal.message}
      type={successModal.type || 'success'}
      confirmText="Entendido"
      showCancel={false}
      onConfirm={() => {
        setSuccessModal({ ...successModal, isOpen: false })
        if (successModal.title === 'Sucesso!') {
          handleBack()
        }
      }}
    />
    <RejectModal
      isOpen={!!rejectInfo}
      onClose={() => setRejectInfo(null)}
      onConfirm={confirmReject}
    />
    </>
  )
}
