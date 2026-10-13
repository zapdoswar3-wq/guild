"use server";

import { parseDateInput } from "@/lib/dates";
import { failure, formDataToObject, parseInput, revalidateApp } from "@/lib/action-utils";
import { requireUser } from "@/lib/session";
import { assertGuildExists, assertMemberInGuild } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { missaoSchema } from "@/lib/validators";

export async function createMissao(formData: FormData) {
  await requireUser();
  const parsed = parseInput(missaoSchema, formDataToObject(formData));
  if (!parsed.ok) return parsed;
  const guildError = await assertGuildExists(parsed.data.guildId);
  if (guildError) return failure(guildError, "guildId");
  const memberError = await assertMemberInGuild(parsed.data.responsavelId, parsed.data.guildId);
  if (memberError) return failure(memberError, "responsavelId");

  try {
    await prisma.missao.create({
      data: { ...parsed.data, data: parseDateInput(parsed.data.data) },
    });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return failure("Não foi possível salvar a missão. Tente novamente.");
  }
}

export async function updateMissao(id: string, formData: FormData) {
  await requireUser();
  const parsed = parseInput(missaoSchema, formDataToObject(formData));
  if (!parsed.ok) return parsed;
  const current = await prisma.missao.findUnique({ where: { id }, select: { id: true } });
  if (!current) return failure("Registro não encontrado.");
  const guildError = await assertGuildExists(parsed.data.guildId);
  if (guildError) return failure(guildError, "guildId");
  const memberError = await assertMemberInGuild(parsed.data.responsavelId, parsed.data.guildId);
  if (memberError) return failure(memberError, "responsavelId");

  try {
    await prisma.missao.update({
      where: { id },
      data: { ...parsed.data, data: parseDateInput(parsed.data.data) },
    });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return failure("Não foi possível salvar a missão. Tente novamente.");
  }
}

export async function deleteMissao(id: string) {
  await requireUser();
  const current = await prisma.missao.findUnique({ where: { id }, select: { id: true } });
  if (!current) return failure("Registro não encontrado.");
  try {
    await prisma.missao.delete({ where: { id } });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return failure("Não foi possível excluir a missão. Tente novamente.");
  }
}
