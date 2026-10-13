-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "deveTrocarSenha" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "lider" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "pontos" INTEGER NOT NULL,
    "bonusXp" DECIMAL(65,30) NOT NULL,
    "vagas" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "criadaEm" TIMESTAMP(3) NOT NULL,
    "observacoes" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membro" (
    "id" TEXT NOT NULL,
    "nick" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL,
    "pontos" INTEGER NOT NULL,
    "entrada" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "discord" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Membro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalentoCatalogo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "bonusPorNivel" DECIMAL(65,30) NOT NULL,
    "unidade" TEXT NOT NULL,
    "nivelMax" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "TalentoCatalogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalentoGuild" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "talentoId" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL,

    CONSTRAINT "TalentoGuild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Objetivo" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "responsavelId" TEXT,
    "meta" DOUBLE PRECISION NOT NULL,
    "realizado" DOUBLE PRECISION NOT NULL,
    "prazo" TIMESTAMP(3) NOT NULL,
    "prioridade" TEXT NOT NULL,
    "recompensa" TEXT NOT NULL DEFAULT '',
    "notas" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Objetivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cacada" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "guildId" TEXT NOT NULL,
    "alvo" TEXT NOT NULL,
    "rota" TEXT NOT NULL DEFAULT '',
    "responsavelId" TEXT,
    "meta" INTEGER NOT NULL,
    "realizado" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "pontos" INTEGER NOT NULL,
    "obs" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Cacada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Missao" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "guildId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "responsavelId" TEXT,
    "prioridade" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "pontos" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL,
    "obs" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Missao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_usuario_key" ON "Usuario"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_nome_key" ON "Guild"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Membro_nick_key" ON "Membro"("nick");

-- CreateIndex
CREATE INDEX "Membro_guildId_idx" ON "Membro"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "TalentoCatalogo_nome_key" ON "TalentoCatalogo"("nome");

-- CreateIndex
CREATE INDEX "TalentoGuild_guildId_idx" ON "TalentoGuild"("guildId");

-- CreateIndex
CREATE INDEX "TalentoGuild_talentoId_idx" ON "TalentoGuild"("talentoId");

-- CreateIndex
CREATE UNIQUE INDEX "TalentoGuild_guildId_talentoId_key" ON "TalentoGuild"("guildId", "talentoId");

-- CreateIndex
CREATE INDEX "Objetivo_guildId_idx" ON "Objetivo"("guildId");

-- CreateIndex
CREATE INDEX "Objetivo_responsavelId_idx" ON "Objetivo"("responsavelId");

-- CreateIndex
CREATE INDEX "Cacada_guildId_idx" ON "Cacada"("guildId");

-- CreateIndex
CREATE INDEX "Cacada_data_idx" ON "Cacada"("data");

-- CreateIndex
CREATE INDEX "Cacada_responsavelId_idx" ON "Cacada"("responsavelId");

-- CreateIndex
CREATE INDEX "Missao_guildId_idx" ON "Missao"("guildId");

-- CreateIndex
CREATE INDEX "Missao_data_idx" ON "Missao"("data");

-- CreateIndex
CREATE INDEX "Missao_responsavelId_idx" ON "Missao"("responsavelId");

-- AddForeignKey
ALTER TABLE "Membro" ADD CONSTRAINT "Membro_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentoGuild" ADD CONSTRAINT "TalentoGuild_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentoGuild" ADD CONSTRAINT "TalentoGuild_talentoId_fkey" FOREIGN KEY ("talentoId") REFERENCES "TalentoCatalogo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objetivo" ADD CONSTRAINT "Objetivo_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objetivo" ADD CONSTRAINT "Objetivo_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Membro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cacada" ADD CONSTRAINT "Cacada_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cacada" ADD CONSTRAINT "Cacada_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Membro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Missao" ADD CONSTRAINT "Missao_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Missao" ADD CONSTRAINT "Missao_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Membro"("id") ON DELETE SET NULL ON UPDATE CASCADE;
