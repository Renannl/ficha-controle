// ────────────────────────────────────────────────
// Definição de todas as Operações e seus Checklists
// ────────────────────────────────────────────────

export const OPERACOES = {
  10: {
    codigo: "10",
    nome: "Ficha de Controle (Estrutura)",
    label: "FICHA DE CONTROLE – ESTRUTURA",
    equipe: "MONTAGEM MECÂNICA",
    objetivo: "Validação da estrutura física e componentes.",
    items: [
      { id: 1, descricao: "Conferir o layout da estrutura conforme projeto." },
      { id: 2, descricao: "Montagem e torque da estrutura." },
      { id: 3, descricao: "Montagem de placas e kits funcionais." },
      { id: 4, descricao: "Fixação de trilhos e canaletas." },
      { id: 5, descricao: "Instalar isoladores conforme especificação." },
      { id: 6, descricao: "Fixação de componentes e identificação (Tags)." },
      { id: 7, descricao: "Validar todas as etapas anteriores." },
    ],
  },

  50: {
    codigo: "50",
    nome: "Ficha de TAF (Testes Elétricos)",
    label: "FICHA DE TAF – ENERGIZAÇÃO E TESTES",
    equipe: "CABEAMENTO / COMISSIONAMENTO",
    objetivo: "Energização segura e testes funcionais (TAF).",
    isTaf: true,
    items: [
      { id: 1, descricao: "CONFERÊNCIA DOS COMPONENTES" },
      { id: 2, descricao: "DIMENSIONAL" },
      { id: 3, descricao: "ISOLAÇÃO" },
      { id: 4, descricao: "ENERGIZAÇÃO" },
      { id: 5, descricao: "LIMPEZA DO QUADRO/PAINEL" },
      { id: 6, descricao: "TESTE DE CONTINUIDADE" },
      { id: 7, descricao: "APERTO DE TODOS OS PARAFUSOS" },
    ],
  },

  80: {
    codigo: "80",
    nome: "Relatório Fotográfico",
    label: "RELATÓRIO FOTOGRÁFICO",
    equipe: "INSPEÇÃO",
    objetivo: "Registro fotográfico das evidências.",
    items: [
      {
        id: 1,
        sessao: "52-T2",
        descricao: "DE-PARA PARA RETIRADA DO DISJUNTOR",
      },
      { id: 2, sessao: "52-T2", descricao: "AMARRAÇÃO DE CINTAS / IÇAMENTO" },
      { id: 3, sessao: "52-T2", descricao: "RETIRADA DO DISJUNTOR" },
      { id: 4, sessao: "52-T2", descricao: "INSTALAÇÃO DO NOVO DISJUNTOR" },
      { id: 5, sessao: "52-T2", descricao: "FIXAÇÃO DA BASE" },
      { id: 6, sessao: "52-T2", descricao: "INTERLIGAÇÃO" },
      { id: 7, sessao: "52-ES", descricao: "BUCHA H1 - FASE R" },
      { id: 8, sessao: "52-ES", descricao: "BUCHA H2 - FASE S" },
      { id: 9, sessao: "52-ES", descricao: "BUCHA H3 - FASE T" },
      { id: 10, sessao: "52-ES", descricao: "BUCHA F1 - FASE R" },
      { id: 11, sessao: "52-ES", descricao: "BUCHA F2 - FASE S" },
      { id: 12, sessao: "52-ES", descricao: "BUCHA F3 - FASE T" },
    ],
  },

  90: {
    codigo: "90",
    nome: "Ficha de Qualidade (Inspeção Final)",
    label: "FICHA DE QUALIDADE – INSPEÇÃO FINAL",
    equipe: "QUALIDADE / QA",
    objetivo: "Inspeção final de acabamento e segurança.",
    items: [
      { id: 1, descricao: "Limpeza interna e externa do equipamento." },
      {
        id: 2,
        descricao: "Conferir aperto de todas as conexões (Amostragem).",
      },
      {
        id: 3,
        descricao: "Verificar presença de esquemas elétricos e manuais.",
      },
      {
        id: 4,
        descricao:
          "Conferir placa de identificação e etiquetas de advertência.",
      },
      {
        id: 5,
        descricao: "Inspeção visual de pintura e acabamentos metálicos.",
      },
      { id: 6, descricao: "Validar embalagem e proteção para transporte." },
    ],
  },
};

// Lista de códigos de operação para uso em selects
export const OPERACAO_KEYS = Object.keys(OPERACOES);

// Retorna os itens de checklist para uma operação
export function getChecklistItems(operacaoCodigo) {
  const op = OPERACOES[operacaoCodigo];
  return op ? op.items : OPERACOES["10"].items;
}

// Retorna a operação padrão
export const DEFAULT_OPERACAO = "10";

export const NOTA_DOCUMENTOS =
  "Documentos a serem enviados juntos com o equipamento: Projeto Atualizado " +
  "(última revisão), Formulário de Teste, Checklist, Certificado dos Produtos " +
  "(disjuntor, relé e componentes), Certificado de Pintura, TRT ou ART, " +
  "Laudo de Parametrização.";

export const INSTRUMENTOS_TAF = [
  {
    id: "alicate",
    nome: "Alicate Amperímetro Digital FLUKE",
    serie: "62862036MV",
  },
  { id: "megger", nome: "Megômetro Digital Minipa MI-2552", serie: "2976519" },
  {
    id: "paquimetro",
    nome: "Paquimetro Digital STANDARD GAGE",
    serie: "5J0037201",
  },
  { id: "torque", nome: "Chave de Torque PHOENIX", serie: "F1190532-18" },
  { id: "trena", nome: "Trena fita de aço IRWIN", serie: "TR-01" },
  { id: "termo", nome: "Termo-higrômetro Minipa", serie: "2021/045" },
];

// Gera um ID único compatível com qualquer contexto (HTTP ou HTTPS)
function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  // Fallback manual
  return (
    "xxxx-xxxx-4xxx-yxxx-xxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    }) +
    "-" +
    Date.now().toString(36)
  );
}

// Cria uma ficha em branco com todos os campos vazios
export function createEmptyFicha(operacaoCodigo = DEFAULT_OPERACAO) {
  const op = OPERACOES[operacaoCodigo];

  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    // Identificação do documento
    codigo: "PRO-001",
    folha: "1/1",
    revisao: "01",
    // Dados do equipamento
    nomeEquipamento: "",
    nrInd: "",
    obra: "",
    qtd: "",
    cliente: "",
    tag: "",
    // Planejamento
    dataInicio: "",
    dataTermino: "",
    tempoPrevisto: "",
    recurso: "",
    operacao: operacaoCodigo,
    equipe: op.equipe,
    colaboradores: "",
    objetivo: op.objetivo,

    // Dados específicos de TAF (Se for modelo 50)
    tafData: op.isTaf
      ? {
          testExecutedWithClient: false,
          testExecutedWithoutClient: false,
          identificador: "",
          tensao: "",
          cubiculo: "",
          testadores: "",
          dataTeste: "",
          prazoEntrega: "",
          quemFezProposta: "",
          dataFechamentoProposta: "",
          instrumentosSelecionados: [
            "alicate",
            "megger",
            "paquimetro",
            "torque",
            "trena",
          ],
          megger: {
            rs: "",
            st: "",
            rt: "",
            rn: "",
            sn: "",
            tn: "",
            rgnd: "",
            sgnd: "",
            tgnd: "",
            ngnd: "",
            tensaoAplicada: "",
          },
          hiPot: {
            tensaoAplicada: "",
            leakageR: "",
            leakageS: "",
            leakageT: "",
          },
          isNotApplicable: false,
          hiPotNotApplicable: false,
          functionalNotApplicable: false,
        }
      : null,

    // Dados específicos de Fotos (Se for modelo 80)
    fotoData:
      operacaoCodigo === "80"
        ? {
            verificacoes: Array.from({ length: 15 }, () => ({
              descricao: "",
              imagemRef: "",
              status: "",
            })),
            responsavelTecnico: "",
            dataHoraInicio: "",
          }
        : null,

    // 15 sessões de trabalho
    sessions: Array.from({ length: 15 }, (_, i) => ({
      numero: i + 1,
      data: "",
      hIni: "",
      hFim: "",
    })),
    // Itens do checklist com marcações por sessão
    items: op.items.map((item) => ({
      id: item.id,
      descricao: item.descricao, // Editável se for foto
      sessao: item.sessao || "", // Sessão/Grupo
      sessionMarks: Array(15).fill(""), // '' | 'feito' | 'na'
      resultado: "", // '' | 'ok' | 'na'
      foto: "", // Data URL da foto
    })),
    // Rodapé
    observacoes: "",
    assinaturas: {
      producao: { nome: "", data: "", dataUrl: "" },
      tecnico: { nome: "", data: "", dataUrl: "" },
      supervisor: { nome: "", data: "", dataUrl: "" },
      qualidade: { nome: "", data: "", dataUrl: "" },
    },
    status: "aberta",

    statusAprovacao: "aguardando",

    motivoAprovacao: "",
    motivoReprovacao: "",

    aprovadoPor: "",
    aprovadoEm: "",

    reprovadoPor: "",
    reprovadoEm: "",

    finalizadaAt: null,
    finalizadaAt: null,
  };
}
