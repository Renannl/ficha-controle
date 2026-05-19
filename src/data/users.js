export const INITIAL_USERS = [
  {
    username: 'zuerlan',
    password: '23',
    displayName: 'Zuerlan Lirio',
    role: 'admin',
    permissions: ['all']
  },
  {
    username: '1',
    password: '23',
    displayName: 'Usuário Produção',
    role: 'producao',
    permissions: ['taf', 'controle', 'fotos']
  }
];

export const ROLES = {
  admin: 'Administrador (SuperAdmin)',
  producao: 'Produção (Campo)',
  projetos: 'Projetos (Aprovação)',
  corretor: 'Corretor (Revisão Final)'
};

export const ROLE_PRESETS = {
  producao: [],

  projetos: [
    'aprovar',
    'rejeitar',
    'ver_aprovacao'
  ],

  corretor: [
    'ver_enviadas',
    'rejeitar',
    'editar_ficha'
  ],

  admin: [
    'taf',
    'controle',
    'fotos',
    'aprovar',
    'rejeitar',
    'ver_aprovacao',
    'ver_enviadas',
    'ver_tudo',
    'editar_ficha'
  ]
}
 