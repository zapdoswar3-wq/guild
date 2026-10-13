import { prisma } from "@/lib/prisma";

export async function assertMemberInGuild(membroId: string | null, guildId: string): Promise<string | null> {
  if (!membroId) return null;
  const membro = await prisma.membro.findUnique({
    where: { id: membroId },
    select: { guildId: true },
  });
  if (!membro || membro.guildId !== guildId) {
    return "O responsável precisa ser um membro da guild escolhida.";
  }
  return null;
}

export async function assertMembersInGuild(membroIds: string[], guildId: string): Promise<string | null> {
  const unique = [...new Set(membroIds)];
  if (unique.length === 0) return null;
  const found = await prisma.membro.findMany({
    where: { id: { in: unique }, guildId },
    select: { id: true },
  });
  if (found.length !== unique.length) {
    return "Cada responsável precisa ser um membro da guild escolhida.";
  }
  return null;
}

export async function assertGuildExists(guildId: string): Promise<string | null> {
  const guild = await prisma.guild.findUnique({ where: { id: guildId }, select: { id: true } });
  return guild ? null : "Guild não encontrada.";
}
