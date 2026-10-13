"use server";

import { parseDateInput } from "@/lib/dates";
import { failure, formDataToObject, parseInput, revalidateApp } from "@/lib/action-utils";
import { requireUser } from "@/lib/session";
import { assertGuildExists, assertMemberInGuild } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { objetivoSchema } from "@/lib/validators";

export async function createObjetivo(formData: FormData) {
  await requireUser();
  const parsed = parseInput(objetivoSchema, formDataToObject(formData));
  if (!parsed.ok) return parsed;
  const guildError = await assertGuildExists(parsed.data.guildId);
  if (guildError) return failure(guildError, "guildId");
  const memberError = await assertMemberInGuild(parsed.data.responsavelId, parsed.data.guildId);
  if (memberError) return failure(memberError, "responsavelId");

  try {
    await prisma.objetivo.create({
      data: { ...parsed.data, prazo: parseDateInput(parsed.data.prazo) },
    });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return failure("Não foi possível salvar o objetivo. Tente novamente.");
  }
}

export async function updateObjetivo(id: string, formData: FormData) {
  await requireUser();
  const parsed = parseInput(objetivoSchema, formDataToObject(formData));
  if (!parsed.ok) return parsed;
  const current = await prisma.objetivo.findUnique({ where: { id }, select: { id: true } });
  if (!current) return failure("Registro não encontrado.");
  const guildError = await assertGuildExists(parsed.data.guildId);
  if (guildError) return failure(guildError, "guildId");
  const memberError = await assertMemberInGuild(parsed.data.responsavelId, parsed.data.guildId);
  if (memberError) return failure(memberError, "responsavelId");

  try {
    await prisma.objetivo.update({
      where: { id },
      data: { ...parsed.data, prazo: parseDateInput(parsed.data.prazo) },
    });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return failure("Não foi possível salvar o objetivo. Tente novamente.");
  }
}

export async function deleteObjetivo(id: string) {
  await requireUser();
  const current = await prisma.objetivo.findUnique({ where: { id }, select: { id: true } });
  if (!current) return failure("Registro não encontrado.");
  try {
    await prisma.objetivo.delete({ where: { id } });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return failure("Não foi possível excluir o objetivo. Tente novamente.");
  }
}
