export type GuildOption = { id: string; nome: string };

export type MemberOption = {
  id: string;
  nick: string;
  guildId: string | null;
  guildNome: string | null;
  status: string;
};

export type TalentOption = {
  id: string;
  nome: string;
  bonusPorNivel: number;
  unidade: string;
  nivelMax: number;
  descricao: string;
};

export type AppOptions = {
  guilds: GuildOption[];
  members: MemberOption[];
  talentos: TalentOption[];
};

export type GuildRow = {
  id: string;
  nome: string;
  lider: string;
  tier: string;
  pontos: number;
  bonusXp: number;
  vagas: number;
  status: string;
  criadaEm: string;
  observacoes: string;
  ativos: number;
  membroIds: string[];
  membroNicks: string[];
};

export type GuildPage = {
  rows: GuildRow[];
  summary: {
    total: number;
    membrosAtivos: number;
    pontos: number;
    tierS: number;
  };
};

export type MembroRow = {
  id: string;
  nick: string;
  guildId: string | null;
  guildNome: string | null;
  cargo: string;
  nivel: number;
  pontos: number;
  entrada: string;
  status: string;
  discord: string;
  missoesAbertas: number;
  missoesFeitas: number;
  cacadasFeitas: number;
  taxa: number;
};

export type MembroPage = {
  rows: MembroRow[];
  summary: {
    total: number;
    ativos: number;
    inativosAfastados: number;
    comMissoesAbertas: number;
  };
};

export type TalentoRow = {
  id: string;
  guildId: string;
  guildNome: string;
  talentoId: string;
  talentoNome: string;
  nivel: number;
  nivelMax: number;
  bonusPorNivel: number;
  unidade: string;
  descricao: string;
  bonusAtual: number;
  bonusProximo: number | null;
  progresso: number;
};

export type TalentoPage = {
  rows: TalentoRow[];
  summary: {
    total: number;
    niveis: number;
    noMaximo: number;
    noZero: number;
  };
};

export type ObjetivoRow = {
  id: string;
  guildId: string;
  guildNome: string;
  titulo: string;
  responsavelId: string | null;
  responsavelNick: string | null;
  meta: number;
  realizado: number;
  prazo: string;
  prioridade: string;
  recompensa: string;
  notas: string;
  status: string;
  progresso: number;
};

export type ObjetivoPage = {
  rows: ObjetivoRow[];
  summary: {
    abertos: number;
    emAndamento: number;
    concluidos: number;
    atrasados: number;
  };
};

export type CacadaRow = {
  id: string;
  data: string;
  guildId: string;
  guildNome: string;
  alvo: string;
  rota: string;
  responsavelId: string | null;
  responsavelNick: string | null;
  meta: number;
  realizado: number;
  status: string;
  pontos: number;
  obs: string;
  progresso: number;
};

export type CacadaPage = {
  rows: CacadaRow[];
  summary: {
    noDia: number;
    concluidas: number;
    emAberto: number;
    falharam: number;
  };
};

export type MissaoRow = {
  id: string;
  data: string;
  guildId: string;
  guildNome: string;
  titulo: string;
  tipo: string;
  responsavelIds: string[];
  responsavelNicks: string[];
  prioridade: string;
  status: string;
  pontos: number;
  xp: number;
  obs: string;
};

export type MissaoPage = {
  rows: MissaoRow[];
  summary: {
    noDia: number;
    concluidas: number;
    emAberto: number;
    falharam: number;
  };
};

export type UsuarioRow = {
  id: string;
  nome: string;
  usuario: string;
  admin: boolean;
  permissao: string;
  deveTrocarSenha: boolean;
  criadoEm: string;
};

export type UsuarioPage = {
  rows: UsuarioRow[];
  summary: {
    total: number;
    admins: number;
    contas: number;
  };
  currentUsuario: string;
};

export type CatalogoRow = {
  id: string;
  nome: string;
  bonusPorNivel: number;
  unidade: string;
  nivelMax: number;
  descricao: string;
};

export type OverviewGuild = {
  id: string;
  nome: string;
  tier: string;
  status: string;
  membros: number;
  pontos: number;
  bonusXp: number;
  objetivosAbertos: number;
  missoesFeitas: number;
  missoesTotal: number;
  cacadasFeitas: number;
  cacadasTotal: number;
  conclusao: number | null;
  pontosDia: number;
};

export type OverviewAlert = {
  id: string;
  titulo: string;
  guild: string;
  responsaveis: string;
};

export type OverviewData = {
  data: string;
  cards: {
    guildsAtivas: number;
    guildsRecrutando: number;
    membrosAtivos: number;
    percentualTarefas: number;
    pontosDia: number;
  };
  pendentes: OverviewAlert[];
  falhas: OverviewAlert[];
  guilds: OverviewGuild[];
};
