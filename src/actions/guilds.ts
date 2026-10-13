"use server";

import { parseDateInput } from "@/lib/dates";
import { duplicateMessage, failure, formDataToObject, parseInput, revalidateApp } from "@/lib/action-utils";
import { assertCan } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { guildSchema } from "@/lib/validators";

export async function createGuild(formData: FormData) {
  const denied = await assertCan("create");
  if (denied) return denied;
  const parsed = parseInput(guildSchema, formDataToObject(formData));
  if (!parsed.ok) return parsed;

  try {
    await prisma.guild.create({
      data: { ...parsed.data, criadaEm: parseDateInput(parsed.data.criadaEm) },
    });
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
  const parsed = parseInput(guildSchema, formDataToObject(formData));
  if (!parsed.ok) return parsed;

  const current = await prisma.guild.findUnique({ where: { id }, select: { id: true } });
  if (!current) return failure("Registro não encontrado.");

  try {
    await prisma.guild.update({
      where: { id },
      data: { ...parsed.data, criadaEm: parseDateInput(parsed.data.criadaEm) },
    });
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
