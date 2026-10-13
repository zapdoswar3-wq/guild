import { bonusValor, progressPercent } from "@/lib/format";
import { matches, type Filters } from "@/lib/filters";
import { dayBounds, todayISO, toDateInput } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { permissaoLabel } from "@/lib/permissions";
import { isTarefaAberta, objetivoStatus, pontosContabilizados } from "@/lib/status";
import type {
  AppOptions,
  CacadaPage,
  CatalogoRow,
  GuildPage,
  MembroPage,
  MissaoPage,
  ObjetivoPage,
  OverviewData,
  TalentoPage,
  UsuarioPage,
  UsuarioRow,
} from "@/lib/types";

export async function getOptions(): Promise<AppOptions> {
  const [guilds, members, talentos] = await Promise.all([
    prisma.guild.findMany({ select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
    prisma.membro.findMany({
      select: { id: true, nick: true, guildId: true, status: true, guild: { select: { nome: true } } },
      orderBy: { nick: "asc" },
    }),
    prisma.talentoCatalogo.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return {
    guilds,
    members: members.map((membro) => ({
      id: membro.id,
      nick: membro.nick,
      guildId: membro.guildId,
      guildNome: membro.guild?.nome ?? null,
      status: membro.status,
    })),
    talentos: talentos.map((talento) => ({
      id: talento.id,
      nome: talento.nome,
      bonusPorNivel: Number(talento.bonusPorNivel),
      unidade: talento.unidade,
      nivelMax: talento.nivelMax,
      descricao: talento.descricao,
    })),
  };
}

export async function getGuildPage(filters: Filters): Promise<GuildPage> {
  const guilds = await prisma.guild.findMany({
    include: { membros: { select: { id: true, nick: true, status: true }, orderBy: { nick: "asc" } } },
    orderBy: { nome: "asc" },
  });

  const rows = guilds
    .map((guild) => ({
      id: guild.id,
      nome: guild.nome,
      lider: guild.lider,
      tier: guild.tier,
      pontos: guild.pontos,
      bonusXp: Number(guild.bonusXp),
      vagas: guild.vagas,
      status: guild.status,
      criadaEm: toDateInput(guild.criadaEm),
      observacoes: guild.observacoes,
      ativos: guild.membros.filter((membro) => membro.status === "Ativo").length,
      membroIds: guild.membros.map((membro) => membro.id),
      membroNicks: guild.membros.map((membro) => membro.nick),
    }))
    .filter((guild) => {
      if (filters.guild && guild.id !== filters.guild) return false;
      if (filters.status && guild.status !== filters.status) return false;
      return matches(filters.q, guild.nome, guild.lider, guild.observacoes, ...guild.membroNicks);
    });

  return {
    rows,
    summary: {
      total: guilds.length,
      membrosAtivos: guilds.reduce(
        (sum, guild) => sum + guild.membros.filter((membro) => membro.status === "Ativo").length,
        0,
      ),
      pontos: guilds.reduce((sum, guild) => sum + guild.pontos, 0),
      tierS: guilds.filter((guild) => guild.tier === "S").length,
    },
  };
}

export async function getMembroPage(filters: Filters): Promise<MembroPage> {
  const membros = await prisma.membro.findMany({
    include: {
      guild: { select: { nome: true } },
      missaoResponsaveis: { select: { missao: { select: { status: true } } } },
      cacadas: { select: { status: true } },
    },
    orderBy: { nick: "asc" },
  });

  const mapped = membros.map((membro) => {
    const missoes = membro.missaoResponsaveis.map((item) => item.missao);
    const missoesFeitas = missoes.filter((missao) => missao.status === "Concluída").length;
    const cacadasFeitas = membro.cacadas.filter((cacada) => cacada.status === "Concluída").length;
    const total = missoes.length + membro.cacadas.length;
    const feitas = missoesFeitas + cacadasFeitas;
    return {
      id: membro.id,
      nick: membro.nick,
      guildId: membro.guildId,
      guildNome: membro.guild?.nome ?? null,
      cargo: membro.cargo,
      nivel: membro.nivel,
      pontos: membro.pontos,
      entrada: toDateInput(membro.entrada),
      status: membro.status,
      discord: membro.discord,
      missoesAbertas: missoes.filter((missao) => isTarefaAberta(missao.status)).length,
      missoesFeitas,
      cacadasFeitas,
      taxa: total === 0 ? 0 : (feitas / total) * 100,
    };
  });

  return {
    rows: mapped.filter((membro) => {
      if (filters.guild && membro.guildId !== filters.guild) return false;
      if (filters.status && membro.status !== filters.status) return false;
      return matches(filters.q, membro.nick, membro.discord, membro.guildNome, membro.cargo);
    }),
    summary: {
      total: mapped.length,
      ativos: mapped.filter((membro) => membro.status === "Ativo").length,
      inativosAfastados: mapped.filter((membro) => membro.status === "Inativo" || membro.status === "Afastado")
        .length,
      comMissoesAbertas: mapped.filter((membro) => membro.missoesAbertas > 0).length,
    },
  };
}

function nivelStatus(nivel: number, nivelMax: number): string {
  if (nivel <= 0) return "Nível 0";
  if (nivel >= nivelMax) return "Nível máximo";
  return "Em progresso";
}

export async function getTalentoPage(filters: Filters): Promise<TalentoPage> {
  const talentos = await prisma.talentoGuild.findMany({
    include: {
      guild: { select: { nome: true } },
      talento: true,
    },
    orderBy: [{ guild: { nome: "asc" } }, { talento: { nome: "asc" } }],
  });

  const mapped = talentos.map((item) => {
    const bonusPorNivel = Number(item.talento.bonusPorNivel);
    const nivelMax = item.talento.nivelMax;
    return {
      id: item.id,
      guildId: item.guildId,
      guildNome: item.guild.nome,
      talentoId: item.talentoId,
      talentoNome: item.talento.nome,
      nivel: item.nivel,
      nivelMax,
      bonusPorNivel,
      unidade: item.talento.unidade,
      descricao: item.talento.descricao,
      bonusAtual: bonusValor(item.nivel, bonusPorNivel),
      bonusProximo: item.nivel >= nivelMax ? null : bonusValor(item.nivel + 1, bonusPorNivel),
      progresso: progressPercent(item.nivel, nivelMax),
    };
  });

  return {
    rows: mapped.filter((item) => {
      if (filters.guild && item.guildId !== filters.guild) return false;
      if (filters.status && nivelStatus(item.nivel, item.nivelMax) !== filters.status) return false;
      return matches(filters.q, item.talentoNome, item.guildNome, item.descricao, item.unidade);
    }),
    summary: {
      total: mapped.length,
      niveis: mapped.reduce((sum, item) => sum + item.nivel, 0),
      noMaximo: mapped.filter((item) => item.nivel >= item.nivelMax).length,
      noZero: mapped.filter((item) => item.nivel === 0).length,
    },
  };
}

export async function getObjetivoPage(filters: Filters): Promise<ObjetivoPage> {
  const objetivos = await prisma.objetivo.findMany({
    include: {
      guild: { select: { nome: true } },
      responsavel: { select: { nick: true } },
    },
    orderBy: { prazo: "asc" },
  });

  const mapped = objetivos.map((objetivo) => ({
    id: objetivo.id,
    guildId: objetivo.guildId,
    guildNome: objetivo.guild.nome,
    titulo: objetivo.titulo,
    responsavelId: objetivo.responsavelId,
    responsavelNick: objetivo.responsavel?.nick ?? null,
    meta: objetivo.meta,
    realizado: objetivo.realizado,
    prazo: toDateInput(objetivo.prazo),
    prioridade: objetivo.prioridade,
    recompensa: objetivo.recompensa,
    notas: objetivo.notas,
    status: objetivoStatus(objetivo),
    progresso: progressPercent(objetivo.realizado, objetivo.meta),
  }));

  return {
    rows: mapped.filter((objetivo) => {
      if (filters.guild && objetivo.guildId !== filters.guild) return false;
      if (filters.status && objetivo.status !== filters.status) return false;
      return matches(filters.q, objetivo.titulo, objetivo.recompensa, objetivo.responsavelNick, objetivo.notas);
    }),
    summary: {
      abertos: mapped.filter((objetivo) => objetivo.status !== "Concluído").length,
      emAndamento: mapped.filter((objetivo) => objetivo.status === "Em andamento").length,
      concluidos: mapped.filter((objetivo) => objetivo.status === "Concluído").length,
      atrasados: mapped.filter((objetivo) => objetivo.status === "Atrasado").length,
    },
  };
}

export async function getCacadaPage(filters: Filters, data: string): Promise<CacadaPage> {
  const bounds = dayBounds(data);
  const [doDia, emAberto] = await Promise.all([
    prisma.cacada.findMany({
      where: { data: bounds },
      include: {
        guild: { select: { nome: true } },
        responsavel: { select: { nick: true } },
      },
      orderBy: { alvo: "asc" },
    }),
    prisma.cacada.count({ where: { status: { in: ["Pendente", "Em andamento"] } } }),
  ]);

  const mapped = doDia.map((cacada) => ({
    id: cacada.id,
    data: toDateInput(cacada.data),
    guildId: cacada.guildId,
    guildNome: cacada.guild.nome,
    alvo: cacada.alvo,
    rota: cacada.rota,
    responsavelId: cacada.responsavelId,
    responsavelNick: cacada.responsavel?.nick ?? null,
    meta: cacada.meta,
    realizado: cacada.realizado,
    status: cacada.status,
    pontos: cacada.pontos,
    obs: cacada.obs,
    progresso: progressPercent(cacada.realizado, cacada.meta),
  }));

  return {
    rows: mapped.filter((cacada) => {
      if (filters.guild && cacada.guildId !== filters.guild) return false;
      if (filters.status && cacada.status !== filters.status) return false;
      return matches(filters.q, cacada.alvo, cacada.rota, cacada.responsavelNick, cacada.obs);
    }),
    summary: {
      noDia: mapped.length,
      concluidas: mapped.filter((cacada) => cacada.status === "Concluída").length,
      emAberto,
      falharam: mapped.filter((cacada) => cacada.status === "Falhou").length,
    },
  };
}

export async function getMissaoPage(filters: Filters, data: string): Promise<MissaoPage> {
  const bounds = dayBounds(data);
  const [doDia, emAberto] = await Promise.all([
    prisma.missao.findMany({
      where: { data: bounds },
      include: {
        guild: { select: { nome: true } },
        responsaveis: { include: { membro: { select: { id: true, nick: true } } } },
      },
      orderBy: { titulo: "asc" },
    }),
    prisma.missao.count({ where: { status: { in: ["Pendente", "Em andamento"] } } }),
  ]);

  const mapped = doDia.map((missao) => ({
    id: missao.id,
    data: toDateInput(missao.data),
    guildId: missao.guildId,
    guildNome: missao.guild.nome,
    titulo: missao.titulo,
    tipo: missao.tipo,
    responsavelIds: missao.responsaveis.map((item) => item.membro.id),
    responsavelNicks: missao.responsaveis.map((item) => item.membro.nick),
    prioridade: missao.prioridade,
    status: missao.status,
    pontos: missao.pontos,
    xp: missao.xp,
    obs: missao.obs,
  }));

  return {
    rows: mapped.filter((missao) => {
      if (filters.guild && missao.guildId !== filters.guild) return false;
      if (filters.status && missao.status !== filters.status) return false;
      return matches(filters.q, missao.titulo, missao.tipo, missao.responsavelNicks.join(" "), missao.obs);
    }),
    summary: {
      noDia: mapped.length,
      concluidas: mapped.filter((missao) => missao.status === "Concluída").length,
      emAberto,
      falharam: mapped.filter((missao) => missao.status === "Falhou").length,
    },
  };
}

export async function getCatalogo(filters: Filters): Promise<CatalogoRow[]> {
  const talentos = await prisma.talentoCatalogo.findMany({ orderBy: { nome: "asc" } });
  return talentos
    .map((talento) => ({
      id: talento.id,
      nome: talento.nome,
      bonusPorNivel: Number(talento.bonusPorNivel),
      unidade: talento.unidade,
      nivelMax: talento.nivelMax,
      descricao: talento.descricao,
    }))
    .filter((talento) => matches(filters.q, talento.nome, talento.unidade, talento.descricao));
}

export async function getOverview(data: string): Promise<OverviewData> {
  const bounds = dayBounds(data);
  const [guilds, missoes, cacadas, objetivos] = await Promise.all([
    prisma.guild.findMany({
      include: { membros: { select: { status: true } } },
      orderBy: { nome: "asc" },
    }),
    prisma.missao.findMany({
      where: { data: bounds },
      include: {
        guild: { select: { nome: true } },
        responsaveis: { include: { membro: { select: { nick: true } } } },
      },
    }),
    prisma.cacada.findMany({ where: { data: bounds } }),
    prisma.objetivo.findMany(),
  ]);

  const membrosAtivos = guilds.reduce(
    (sum, guild) => sum + guild.membros.filter((membro) => membro.status === "Ativo").length,
    0,
  );
  const tarefas = missoes.length + cacadas.length;
  const concluidas =
    missoes.filter((missao) => missao.status === "Concluída").length +
    cacadas.filter((cacada) => cacada.status === "Concluída").length;
  const pontosDia =
    missoes.reduce((sum, missao) => sum + pontosContabilizados(missao.status, missao.pontos), 0) +
    cacadas.reduce((sum, cacada) => sum + pontosContabilizados(cacada.status, cacada.pontos), 0);

  return {
    data,
    cards: {
      guildsAtivas: guilds.filter((guild) => guild.status === "Ativa").length,
      guildsRecrutando: guilds.filter((guild) => guild.status === "Recrutando").length,
      membrosAtivos,
      percentualTarefas: tarefas === 0 ? 0 : (concluidas / tarefas) * 100,
      pontosDia,
    },
    pendentes: missoes
      .filter((missao) => missao.status === "Pendente")
      .map((missao) => ({
        id: missao.id,
        titulo: missao.titulo,
        guild: missao.guild.nome,
        responsaveis: missao.responsaveis.map((item) => item.membro.nick).join(", "),
      })),
    falhas: missoes
      .filter((missao) => missao.status === "Falhou")
      .map((missao) => ({
        id: missao.id,
        titulo: missao.titulo,
        guild: missao.guild.nome,
        responsaveis: missao.responsaveis.map((item) => item.membro.nick).join(", "),
      })),
    guilds: guilds.map((guild) => {
      const missoesGuild = missoes.filter((missao) => missao.guildId === guild.id);
      const cacadasGuild = cacadas.filter((cacada) => cacada.guildId === guild.id);
      const missoesFeitas = missoesGuild.filter((missao) => missao.status === "Concluída").length;
      const cacadasFeitas = cacadasGuild.filter((cacada) => cacada.status === "Concluída").length;
      const total = missoesGuild.length + cacadasGuild.length;
      return {
        id: guild.id,
        nome: guild.nome,
        tier: guild.tier,
        status: guild.status,
        membros: guild.membros.filter((membro) => membro.status === "Ativo").length,
        pontos: guild.pontos,
        bonusXp: Number(guild.bonusXp),
        objetivosAbertos: objetivos.filter(
          (objetivo) => objetivo.guildId === guild.id && objetivoStatus(objetivo) !== "Concluído",
        ).length,
        missoesFeitas,
        missoesTotal: missoesGuild.length,
        cacadasFeitas,
        cacadasTotal: cacadasGuild.length,
        conclusao: total === 0 ? null : ((missoesFeitas + cacadasFeitas) / total) * 100,
        pontosDia:
          missoesGuild.reduce((sum, missao) => sum + pontosContabilizados(missao.status, missao.pontos), 0) +
          cacadasGuild.reduce((sum, cacada) => sum + pontosContabilizados(cacada.status, cacada.pontos), 0),
      };
    }),
  };
}

export async function getUsuarios(filters: Filters, currentUsuario: string): Promise<UsuarioPage> {
  const users = await prisma.usuario.findMany({ orderBy: [{ admin: "desc" }, { nome: "asc" }] });
  const rows: UsuarioRow[] = users.map((user) => ({
    id: user.id,
    nome: user.nome,
    usuario: user.usuario,
    admin: user.admin,
    permissao: user.permissao,
    deveTrocarSenha: user.deveTrocarSenha,
    criadoEm: todayISO(user.criadoEm),
  }));
  const admins = rows.filter((row) => row.admin).length;

  return {
    rows: rows.filter((row) =>
      matches(filters.q, row.nome, row.usuario, permissaoLabel(row), row.admin ? "Administrador" : "Usuário"),
    ),
    summary: { total: rows.length, admins, contas: rows.length - admins },
    currentUsuario,
  };
}
