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
  operador: 'Operador',
  projetos: 'Projetos (Aprovação)',
  aprovacao: 'Aprovação',
  corretor: 'Corretor (Revisão Final)'
};
 