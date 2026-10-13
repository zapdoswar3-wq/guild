"use server";

import { duplicateMessage, failure, formDataToObject, parseInput, revalidateApp } from "@/lib/action-utils";
import { requireUser } from "@/lib/session";
import { assertGuildExists } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { talentoGuildSchema } from "@/lib/validators";

async function validateNivel(talentoId: string, nivel: number) {
  const talento = await prisma.talentoCatalogo.findUnique({
    where: { id: talentoId },
    select: { nivelMax: true },
  });
  if (!talento) return "Talento não encontrado.";
  if (nivel > talento.nivelMax) return `O nível deve ficar entre 0 e ${talento.nivelMax}.`;
  return null;
}

export async function createTalentoGuild(formData: FormData) {
  await requireUser();
  const parsed = parseInput(talentoGuildSchema, formDataToObject(formData));
  if (!parsed.ok) return parsed;
  const guildError = await assertGuildExists(parsed.data.guildId);
  if (guildError) return failure(guildError, "guildId");
  const nivelError = await validateNivel(parsed.data.talentoId, parsed.data.nivel);
  if (nivelError) return failure(nivelError, "nivel");

  try {
    await prisma.talentoGuild.create({ data: parsed.data });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    const duplicate = duplicateMessage(error, "Essa guild já possui este talento.");
    if (duplicate) return failure(duplicate, "talentoId");
    console.error(error);
    return failure("Não foi possível salvar o talento. Tente novamente.");
  }
}

export async function updateTalentoGuild(id: string, formData: FormData) {
  await requireUser();
  const parsed = parseInput(talentoGuildSchema, formDataToObject(formData));
  if (!parsed.ok) return parsed;
  const current = await prisma.talentoGuild.findUnique({ where: { id }, select: { id: true } });
  if (!current) return failure("Registro não encontrado.");
  const guildError = await assertGuildExists(parsed.data.guildId);
  if (guildError) return failure(guildError, "guildId");
  const nivelError = await validateNivel(parsed.data.talentoId, parsed.data.nivel);
  if (nivelError) return failure(nivelError, "nivel");

  try {
    await prisma.talentoGuild.update({ where: { id }, data: parsed.data });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    const duplicate = duplicateMessage(error, "Essa guild já possui este talento.");
    if (duplicate) return failure(duplicate, "talentoId");
    console.error(error);
    return failure("Não foi possível salvar o talento. Tente novamente.");
  }
}

export async function deleteTalentoGuild(id: string) {
  await requireUser();
  const current = await prisma.talentoGuild.findUnique({ where: { id }, select: { id: true } });
  if (!current) return failure("Registro não encontrado.");
  try {
    await prisma.talentoGuild.delete({ where: { id } });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return failure("Não foi possível excluir o talento. Tente novamente.");
  }
}
