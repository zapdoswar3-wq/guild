"use server";

import { parseDateInput } from "@/lib/dates";
import { failure, formDataToObject, parseInput, revalidateApp } from "@/lib/action-utils";
import { assertCan } from "@/lib/session";
import { assertGuildExists, assertMembersInGuild } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { missaoSchema } from "@/lib/validators";

function missaoInput(formData: FormData) {
  const responsavelIds = [
    ...new Set(
      formData
        .getAll("responsavelIds")
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
        .map((value) => value.trim()),
    ),
  ];
  return { ...formDataToObject(formData), responsavelIds };
}

export async function createMissao(formData: FormData) {
  const denied = await assertCan("create");
  if (denied) return denied;
  const parsed = parseInput(missaoSchema, missaoInput(formData));
  if (!parsed.ok) return parsed;
  const { responsavelIds, ...data } = parsed.data;
  const guildError = await assertGuildExists(data.guildId);
  if (guildError) return failure(guildError, "guildId");
  const memberError = await assertMembersInGuild(responsavelIds, data.guildId);
  if (memberError) return failure(memberError, "responsavelIds");

  try {
    await prisma.missao.create({
      data: {
        ...data,
        data: parseDateInput(data.data),
        responsaveis: { create: responsavelIds.map((membroId) => ({ membroId })) },
      },
    });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return failure("Não foi possível salvar a missão. Tente novamente.");
  }
}

export async function updateMissao(id: string, formData: FormData) {
  const denied = await assertCan("edit");
  if (denied) return denied;
  const parsed = parseInput(missaoSchema, missaoInput(formData));
  if (!parsed.ok) return parsed;
  const { responsavelIds, ...data } = parsed.data;
  const current = await prisma.missao.findUnique({ where: { id }, select: { id: true } });
  if (!current) return failure("Registro não encontrado.");
  const guildError = await assertGuildExists(data.guildId);
  if (guildError) return failure(guildError, "guildId");
  const memberError = await assertMembersInGuild(responsavelIds, data.guildId);
  if (memberError) return failure(memberError, "responsavelIds");

  try {
    await prisma.missao.update({
      where: { id },
      data: {
        ...data,
        data: parseDateInput(data.data),
        responsaveis: {
          deleteMany: {},
          create: responsavelIds.map((membroId) => ({ membroId })),
        },
      },
    });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return failure("Não foi possível salvar a missão. Tente novamente.");
  }
}

export async function deleteMissao(id: string) {
  const denied = await assertCan("delete");
  if (denied) return denied;
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
