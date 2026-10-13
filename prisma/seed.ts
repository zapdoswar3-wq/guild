import { PrismaClient } from "@prisma/client";
import { parseDateInput, shiftISO, todayISO } from "../src/lib/dates";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

const talentos = [
  {
    nome: "Instinto de Batalha",
    bonusPorNivel: 0.2,
    unidade: "p.p. de XP (toda a guild)",
    nivelMax: 5,
    descricao: "+0,2 ponto percentual de XP por nível, para toda a guild.",
  },
  {
    nome: "Olho de Colecionador",
    bonusPorNivel: 2,
    unidade: "% de loot (toda a guild)",
    nivelMax: 5,
    descricao: "+2% de loot por nível, para toda a guild.",
  },
  {
    nome: "Mestre das Pokébolas",
    bonusPorNivel: 1.5,
    unidade: "% de chance de captura",
    nivelMax: 5,
    descricao: "+1,5% de chance de captura por nível.",
  },
  {
    nome: "Calor do Ninho",
    bonusPorNivel: 3,
    unidade: "% de progresso de choco",
    nivelMax: 5,
    descricao: "+3% de progresso de choco por nível.",
  },
  {
    nome: "Eco do Tributo",
    bonusPorNivel: 2,
    unidade: "min no buff do Tributo",
    nivelMax: 5,
    descricao: "+2 min na duração do buff do Tributo por nível.",
  },
] as const;

const niveis = [1, 1, 0, 0, 0];

async function main() {
  const contas = await prisma.usuario.count();
  if (contas > 0) {
    console.log("Banco já possui usuários. Seed ignorado.");
    return;
  }

  await prisma.missao.deleteMany();
  await prisma.cacada.deleteMany();
  await prisma.objetivo.deleteMany();
  await prisma.talentoGuild.deleteMany();
  await prisma.membro.deleteMany();
  await prisma.guild.deleteMany();
  await prisma.talentoCatalogo.deleteMany();

  const today = todayISO();
  const on = (days: number) => parseDateInput(shiftISO(today, days));

  const catalogo = [];
  for (const talento of talentos) {
    catalogo.push(await prisma.talentoCatalogo.create({ data: { ...talento } }));
  }

  const kanto = await prisma.guild.create({
    data: {
      nome: "Kanto Hunters",
      lider: "RedKanto",
      tier: "A",
      pontos: 18450,
      bonusXp: 15,
      vagas: 30,
      status: "Ativa",
      criadaEm: on(-200),
      observacoes: "Guild focada em rotas iniciais e ginásios de Kanto.",
    },
  });
  const johto = await prisma.guild.create({
    data: {
      nome: "Johto Legends",
      lider: "GoldJohto",
      tier: "B",
      pontos: 9720,
      bonusXp: 10,
      vagas: 25,
      status: "Recrutando",
      criadaEm: on(-140),
      observacoes: "Recrutando treinadores para as torres e raids de Johto.",
    },
  });
  const hoenn = await prisma.guild.create({
    data: {
      nome: "Hoenn Raiders",
      lider: "RubyHoenn",
      tier: "S",
      pontos: 31200,
      bonusXp: 25,
      vagas: 40,
      status: "Ativa",
      criadaEm: on(-80),
      observacoes: "Guild de elite, prioridade em raids e evolução.",
    },
  });

  const membros = [
    { nick: "RedKanto", guildId: kanto.id, cargo: "Líder", nivel: 48, pontos: 4200, entrada: on(-190), status: "Ativo", discord: "redkanto" },
    { nick: "MistyWater", guildId: kanto.id, cargo: "Vice-líder", nivel: 45, pontos: 3100, entrada: on(-160), status: "Ativo", discord: "mistywater" },
    { nick: "BrockRock", guildId: kanto.id, cargo: "Oficial", nivel: 41, pontos: 1800, entrada: on(-120), status: "Ativo", discord: "brockrock" },
    { nick: "SurgeVolt", guildId: kanto.id, cargo: "Membro", nivel: 38, pontos: 900, entrada: on(-40), status: "Afastado", discord: "surgevolt" },
    { nick: "GoldJohto", guildId: johto.id, cargo: "Líder", nivel: 40, pontos: 2100, entrada: on(-130), status: "Ativo", discord: "goldjohto" },
    { nick: "CrystalWing", guildId: johto.id, cargo: "Vice-líder", nivel: 37, pontos: 1600, entrada: on(-100), status: "Ativo", discord: "crystalwing" },
    { nick: "SilverRival", guildId: johto.id, cargo: "Oficial", nivel: 33, pontos: 800, entrada: on(-90), status: "Inativo", discord: "silverrival" },
    { nick: "FalknerSky", guildId: johto.id, cargo: "Recruta", nivel: 22, pontos: 350, entrada: on(-12), status: "Ativo", discord: "" },
    { nick: "RubyHoenn", guildId: hoenn.id, cargo: "Líder", nivel: 55, pontos: 8000, entrada: on(-75), status: "Ativo", discord: "rubyhoenn" },
    { nick: "SapphireSea", guildId: hoenn.id, cargo: "Vice-líder", nivel: 52, pontos: 6400, entrada: on(-70), status: "Ativo", discord: "sapphiresea" },
    { nick: "WallaceKing", guildId: hoenn.id, cargo: "Oficial", nivel: 49, pontos: 4100, entrada: on(-50), status: "Ativo", discord: "wallaceking" },
    { nick: "MayRoute", guildId: hoenn.id, cargo: "Membro", nivel: 36, pontos: 2200, entrada: on(-20), status: "Ativo", discord: "mayroute" },
  ];

  const byNick: Record<string, string> = {};
  for (const membro of membros) {
    const created = await prisma.membro.create({ data: membro });
    byNick[created.nick] = created.id;
  }

  for (const guild of [kanto, johto, hoenn]) {
    for (let index = 0; index < catalogo.length; index += 1) {
      await prisma.talentoGuild.create({
        data: {
          guildId: guild.id,
          talentoId: catalogo[index].id,
          nivel: niveis[index],
        },
      });
    }
  }

  await prisma.objetivo.createMany({
    data: [
      {
        guildId: kanto.id,
        titulo: "Derrotar 50 líderes de ginásio",
        responsavelId: byNick.RedKanto,
        meta: 50,
        realizado: 32,
        prazo: on(10),
        prioridade: "Alta",
        recompensa: "500 pontos de guild",
        notas: "Conta apenas ginásios oficiais.",
      },
      {
        guildId: kanto.id,
        titulo: "Coletar 200 frutos",
        responsavelId: byNick.MistyWater,
        meta: 200,
        realizado: 0,
        prazo: on(5),
        prioridade: "Média",
        recompensa: "Baú de rotas",
        notas: "",
      },
      {
        guildId: johto.id,
        titulo: "Capturar 10 lendários",
        responsavelId: byNick.GoldJohto,
        meta: 10,
        realizado: 10,
        prazo: on(2),
        prioridade: "Alta",
        recompensa: "Título de lenda",
        notas: "Meta já batida.",
      },
      {
        guildId: johto.id,
        titulo: "Doar 5.000 pontos ao cofre",
        responsavelId: byNick.CrystalWing,
        meta: 5000,
        realizado: 1200,
        prazo: on(-4),
        prioridade: "Alta",
        recompensa: "Buff do Tributo",
        notas: "Prazo vencido com a meta ainda aberta.",
      },
      {
        guildId: hoenn.id,
        titulo: "Completar 20 raids",
        responsavelId: byNick.RubyHoenn,
        meta: 20,
        realizado: 8,
        prazo: on(7),
        prioridade: "Média",
        recompensa: "1.000 pontos",
        notas: "",
      },
      {
        guildId: hoenn.id,
        titulo: "Evoluir 15 Pokémon",
        responsavelId: byNick.MayRoute,
        meta: 15,
        realizado: 0,
        prazo: on(-2),
        prioridade: "Baixa",
        recompensa: "Pedra rara",
        notas: "Ninguém começou e o prazo já passou.",
      },
    ],
  });

  const missoesSeed = [
    { data: on(0), guildId: kanto.id, titulo: "Ginásio de Pewter", tipo: "Batalha", responsaveis: [byNick.RedKanto, byNick.MistyWater], prioridade: "Alta", status: "Concluída", pontos: 120, xp: 400, obs: "" },
    { data: on(0), guildId: kanto.id, titulo: "Pidgey da Rota 1", tipo: "Captura", responsaveis: [byNick.MistyWater], prioridade: "Média", status: "Em andamento", pontos: 80, xp: 200, obs: "Faltam bolas." },
    { data: on(0), guildId: kanto.id, titulo: "Frutas da Rota 2", tipo: "Coleta", responsaveis: [byNick.BrockRock], prioridade: "Baixa", status: "Pendente", pontos: 40, xp: 80, obs: "" },
    { data: on(0), guildId: johto.id, titulo: "Tributo semanal", tipo: "Doação", responsaveis: [byNick.GoldJohto], prioridade: "Alta", status: "Falhou", pontos: 60, xp: 0, obs: "Cofre insuficiente." },
    { data: on(0), guildId: johto.id, titulo: "Lugia do Whirl Islands", tipo: "Raid", responsaveis: [byNick.CrystalWing, byNick.GoldJohto], prioridade: "Alta", status: "Concluída", pontos: 200, xp: 800, obs: "" },
    { data: on(0), guildId: hoenn.id, titulo: "Eevee da equipe", tipo: "Evolução", responsaveis: [byNick.RubyHoenn], prioridade: "Média", status: "Concluída", pontos: 90, xp: 350, obs: "" },
    { data: on(0), guildId: hoenn.id, titulo: "Elite Four", tipo: "Batalha", responsaveis: [byNick.SapphireSea, byNick.MayRoute], prioridade: "Alta", status: "Pendente", pontos: 150, xp: 500, obs: "" },
    { data: on(-1), guildId: hoenn.id, titulo: "Berries da Rota 104", tipo: "Coleta", responsaveis: [byNick.MayRoute], prioridade: "Baixa", status: "Em andamento", pontos: 50, xp: 100, obs: "Continua aberta de ontem." },
  ];
  for (const missao of missoesSeed) {
    const { responsaveis, ...data } = missao;
    await prisma.missao.create({
      data: { ...data, responsaveis: { create: responsaveis.map((membroId) => ({ membroId })) } },
    });
  }

  await prisma.cacada.createMany({
    data: [
      { data: on(0), guildId: kanto.id, alvo: "Pidgey", rota: "Rota 1", responsavelId: byNick.RedKanto, meta: 20, realizado: 20, status: "Concluída", pontos: 50, obs: "" },
      { data: on(0), guildId: kanto.id, alvo: "Rattata", rota: "Rota 2", responsavelId: byNick.BrockRock, meta: 30, realizado: 12, status: "Em andamento", pontos: 40, obs: "" },
      { data: on(0), guildId: johto.id, alvo: "Sentret", rota: "Rota 29", responsavelId: byNick.GoldJohto, meta: 15, realizado: 0, status: "Pendente", pontos: 30, obs: "" },
      { data: on(0), guildId: johto.id, alvo: "Hoothoot", rota: "Rota 30", responsavelId: byNick.CrystalWing, meta: 10, realizado: 4, status: "Falhou", pontos: 25, obs: "A rota fechou." },
      { data: on(0), guildId: hoenn.id, alvo: "Zigzagoon", rota: "Rota 101", responsavelId: byNick.RubyHoenn, meta: 25, realizado: 25, status: "Concluída", pontos: 60, obs: "" },
      { data: on(0), guildId: hoenn.id, alvo: "Poochyena", rota: "Rota 101", responsavelId: byNick.SapphireSea, meta: 20, realizado: 8, status: "Em andamento", pontos: 45, obs: "" },
    ],
  });

  const [guildCount, membroCount, talentoCount, objetivoCount, missaoCount, cacadaCount] = await Promise.all([
    prisma.guild.count(),
    prisma.membro.count(),
    prisma.talentoGuild.count(),
    prisma.objetivo.count(),
    prisma.missao.count(),
    prisma.cacada.count(),
  ]);

  console.log(`Catálogo: ${catalogo.length}`);
  console.log(`Guilds: ${guildCount}`);
  console.log(`Membros: ${membroCount}`);
  console.log(`Talentos de guild: ${talentoCount}`);
  console.log(`Objetivos: ${objetivoCount}`);
  console.log(`Missões: ${missaoCount}`);
  console.log(`Caçadas: ${cacadaCount}`);
  console.log(`Data de referência: ${today}`);

  const adminPassword = process.env.ADMIN_PASSWORD?.trim() ?? "";
  if (!adminPassword) {
    console.log("ADMIN_PASSWORD ausente: a conta administrador não foi alterada.");
    return;
  }
  if (process.env.NODE_ENV === "production" && adminPassword.length < 8) {
    throw new Error("Em produção, ADMIN_PASSWORD precisa ter pelo menos 8 caracteres.");
  }

  await prisma.usuario.upsert({
    where: { usuario: "lucas" },
    update: { nome: "Lucas", senhaHash: await hashPassword(adminPassword), admin: true },
    create: { usuario: "lucas", nome: "Lucas", senhaHash: await hashPassword(adminPassword), admin: true },
  });
  console.log("Usuário administrador: lucas");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
