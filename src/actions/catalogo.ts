"use server";

import { duplicateMessage, failure, formDataToObject, parseInput, revalidateApp } from "@/lib/action-utils";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { catalogoSchema } from "@/lib/validators";

export async function createCatalogo(formData: FormData) {
  await requireUser();
  const parsed = parseInput(catalogoSchema, formDataToObject(formData));
  if (!parsed.ok) return parsed;

  try {
    await prisma.talentoCatalogo.create({ data: parsed.data });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    const duplicate = duplicateMessage(error, "Já existe um talento com esse nome.");
    if (duplicate) return failure(duplicate, "nome");
    console.error(error);
    return failure("Não foi possível salvar o talento. Tente novamente.");
  }
}

export async function updateCatalogo(id: string, formData: FormData) {
  await requireUser();
  const parsed = parseInput(catalogoSchema, formDataToObject(formData));
  if (!parsed.ok) return parsed;
  const current = await prisma.talentoCatalogo.findUnique({ where: { id }, select: { id: true } });
  if (!current) return failure("Registro não encontrado.");

  const acima = await prisma.talentoGuild.count({
    where: { talentoId: id, nivel: { gt: parsed.data.nivelMax } },
  });
  if (acima > 0) {
    return failure("Há guilds com este talento acima do novo nível máximo.", "nivelMax");
  }

  try {
    await prisma.talentoCatalogo.update({ where: { id }, data: parsed.data });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    const duplicate = duplicateMessage(error, "Já existe um talento com esse nome.");
    if (duplicate) return failure(duplicate, "nome");
    console.error(error);
    return failure("Não foi possível salvar o talento. Tente novamente.");
  }
}

export async function deleteCatalogo(id: string) {
  await requireUser();
  const current = await prisma.talentoCatalogo.findUnique({ where: { id }, select: { id: true } });
  if (!current) return failure("Registro não encontrado.");
  try {
    await prisma.talentoCatalogo.delete({ where: { id } });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return failure("Não foi possível excluir o talento. Tente novamente.");
  }
}
