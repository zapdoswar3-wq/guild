"use server";

import { parseDateInput } from "@/lib/dates";
import { duplicateMessage, failure, formDataToObject, parseInput, revalidateApp } from "@/lib/action-utils";
import { assertCan } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { guildSchema } from "@/lib/validators";

function guildInput(formData: FormData) {
  return {
    ...formDataToObject(formData),
    membroIds: formData.getAll("membroIds").filter((value): value is string => typeof value === "string"),
  };
}

async function syncMembros(guildId: string, membroIds: string[]) {
  const unique = [...new Set(membroIds)];
  if (unique.length > 0) {
    const found = await prisma.membro.count({ where: { id: { in: unique } } });
    if (found !== unique.length) return "Cada pessoa marcada precisa ser um membro cadastrado.";
  }

  await prisma.$transaction([
    prisma.membro.updateMany({
      where: unique.length > 0 ? { guildId, id: { notIn: unique } } : { guildId },
      data: { guildId: null },
    }),
    ...(unique.length > 0
      ? [prisma.membro.updateMany({ where: { id: { in: unique } }, data: { guildId } })]
      : []),
  ]);
  return null;
}

export async function createGuild(formData: FormData) {
  const denied = await assertCan("create");
  if (denied) return denied;
  const parsed = parseInput(guildSchema, guildInput(formData));
  if (!parsed.ok) return parsed;
  const { membroIds, criadaEm, ...data } = parsed.data;

  try {
    const guild = await prisma.guild.create({
      data: { ...data, criadaEm: parseDateInput(criadaEm) },
    });
    const memberError = await syncMembros(guild.id, membroIds);
    if (memberError) return failure(memberError, "membroIds");
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    const duplicate = duplicateMessage(error, "Já existe uma guild com esse nome.");
    if (duplicate) return failure(duplicate, "nome");
    console.error(error);
    return failure("Não foi possível salvar a guild. Tente novamente.");
  }
}

export async function updateGuild(id: string, formData: FormData) {
  const denied = await assertCan("edit");
  if (denied) return denied;
  const parsed = parseInput(guildSchema, guildInput(formData));
  if (!parsed.ok) return parsed;
  const { membroIds, criadaEm, ...data } = parsed.data;

  const current = await prisma.guild.findUnique({ where: { id }, select: { id: true } });
  if (!current) return failure("Registro não encontrado.");

  try {
    await prisma.guild.update({
      where: { id },
      data: { ...data, criadaEm: parseDateInput(criadaEm) },
    });
    const memberError = await syncMembros(id, membroIds);
    if (memberError) return failure(memberError, "membroIds");
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    const duplicate = duplicateMessage(error, "Já existe uma guild com esse nome.");
    if (duplicate) return failure(duplicate, "nome");
    console.error(error);
    return failure("Não foi possível salvar a guild. Tente novamente.");
  }
}

export async function deleteGuild(id: string) {
  const denied = await assertCan("delete");
  if (denied) return denied;
  const current = await prisma.guild.findUnique({ where: { id }, select: { id: true } });
  if (!current) return failure("Registro não encontrado.");

  try {
    await prisma.guild.delete({ where: { id } });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return failure("Não foi possível excluir a guild. Tente novamente.");
  }
}
