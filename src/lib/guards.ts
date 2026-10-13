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

export async function assertGuildExists(guildId: string): Promise<string | null> {
  const guild = await prisma.guild.findUnique({ where: { id: guildId }, select: { id: true } });
  return guild ? null : "Guild não encontrada.";
}
