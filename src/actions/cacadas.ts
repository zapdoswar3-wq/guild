"use server";

import { parseDateInput } from "@/lib/dates";
import { failure, formDataToObject, parseInput, revalidateApp } from "@/lib/action-utils";
import { assertCan } from "@/lib/session";
import { assertGuildExists, assertMemberInGuild } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { cacadaSchema } from "@/lib/validators";

export async function createCacada(formData: FormData) {
  const denied = await assertCan("create");
  if (denied) return denied;
  const parsed = parseInput(cacadaSchema, formDataToObject(formData));
  if (!parsed.ok) return parsed;
  const guildError = await assertGuildExists(parsed.data.guildId);
  if (guildError) return failure(guildError, "guildId");
  const memberError = await assertMemberInGuild(parsed.data.responsavelId, parsed.data.guildId);
  if (memberError) return failure(memberError, "responsavelId");

  try {
    await prisma.cacada.create({
      data: { ...parsed.data, data: parseDateInput(parsed.data.data) },
    });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return failure("Não foi possível salvar a caçada. Tente novamente.");
  }
}

export async function updateCacada(id: string, formData: FormData) {
  const denied = await assertCan("edit");
  if (denied) return denied;
  const parsed = parseInput(cacadaSchema, formDataToObject(formData));
  if (!parsed.ok) return parsed;
  const current = await prisma.cacada.findUnique({ where: { id }, select: { id: true } });
  if (!current) return failure("Registro não encontrado.");
  const guildError = await assertGuildExists(parsed.data.guildId);
  if (guildError) return failure(guildError, "guildId");
  const memberError = await assertMemberInGuild(parsed.data.responsavelId, parsed.data.guildId);
  if (memberError) return failure(memberError, "responsavelId");

  try {
    await prisma.cacada.update({
      where: { id },
      data: { ...parsed.data, data: parseDateInput(parsed.data.data) },
    });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return failure("Não foi possível salvar a caçada. Tente novamente.");
  }
}

export async function deleteCacada(id: string) {
  const denied = await assertCan("delete");
  if (denied) return denied;
  const current = await prisma.cacada.findUnique({ where: { id }, select: { id: true } });
  if (!current) return failure("Registro não encontrado.");
  try {
    await prisma.cacada.delete({ where: { id } });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return failure("Não foi possível excluir a caçada. Tente novamente.");
  }
}
