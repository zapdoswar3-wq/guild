"use server";

import { parseDateInput } from "@/lib/dates";
import { duplicateMessage, failure, formDataToObject, parseInput, revalidateApp } from "@/lib/action-utils";
import { requireUser } from "@/lib/session";
import { assertGuildExists } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { membroSchema } from "@/lib/validators";

export async function createMembro(formData: FormData) {
  await requireUser();
  const parsed = parseInput(membroSchema, formDataToObject(formData));
  if (!parsed.ok) return parsed;
  const guildError = await assertGuildExists(parsed.data.guildId);
  if (guildError) return failure(guildError, "guildId");

  try {
    await prisma.membro.create({
      data: { ...parsed.data, entrada: parseDateInput(parsed.data.entrada) },
    });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    const duplicate = duplicateMessage(error, "Já existe um membro com esse nick.");
    if (duplicate) return failure(duplicate, "nick");
    console.error(error);
    return failure("Não foi possível salvar o membro. Tente novamente.");
  }
}

export async function updateMembro(id: string, formData: FormData) {
  await requireUser();
  const parsed = parseInput(membroSchema, formDataToObject(formData));
  if (!parsed.ok) return parsed;
  const current = await prisma.membro.findUnique({ where: { id }, select: { id: true } });
  if (!current) return failure("Registro não encontrado.");
  const guildError = await assertGuildExists(parsed.data.guildId);
  if (guildError) return failure(guildError, "guildId");

  try {
    await prisma.membro.update({
      where: { id },
      data: { ...parsed.data, entrada: parseDateInput(parsed.data.entrada) },
    });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    const duplicate = duplicateMessage(error, "Já existe um membro com esse nick.");
    if (duplicate) return failure(duplicate, "nick");
    console.error(error);
    return failure("Não foi possível salvar o membro. Tente novamente.");
  }
}

export async function deleteMembro(id: string) {
  await requireUser();
  const current = await prisma.membro.findUnique({ where: { id }, select: { id: true } });
  if (!current) return failure("Registro não encontrado.");
  try {
    await prisma.membro.delete({ where: { id } });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return failure("Não foi possível excluir o membro. Tente novamente.");
  }
}
