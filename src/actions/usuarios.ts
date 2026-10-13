"use server";

import { duplicateMessage, failure, formDataToObject, parseInput, revalidateApp } from "@/lib/action-utils";
import { hashPassword, SENHA_PADRAO } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { requireAdmin, setSessionCookie } from "@/lib/session";
import { usuarioCreateSchema, usuarioUpdateSchema } from "@/lib/validators";

export async function createUsuario(formData: FormData) {
  await requireAdmin();
  const parsed = parseInput(usuarioCreateSchema, formDataToObject(formData));
  if (!parsed.ok) return parsed;

  try {
    await prisma.usuario.create({
      data: {
        nome: parsed.data.nome,
        usuario: parsed.data.usuario,
        senhaHash: await hashPassword(SENHA_PADRAO),
        permissao: parsed.data.permissao,
        deveTrocarSenha: true,
      },
    });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    const duplicate = duplicateMessage(error, "Já existe uma conta com esse usuário.");
    if (duplicate) return failure(duplicate, "usuario");
    console.error(error);
    return failure("Não foi possível cadastrar o usuário. Tente novamente.");
  }
}

export async function updateUsuario(id: string, formData: FormData) {
  const actor = await requireAdmin();
  const parsed = parseInput(usuarioUpdateSchema, formDataToObject(formData));
  if (!parsed.ok) return parsed;
  const current = await prisma.usuario.findUnique({ where: { id }, select: { id: true, usuario: true, admin: true } });
  if (!current) return failure("Registro não encontrado.");
  if (!current.admin && !parsed.data.permissao) return failure("Selecione a permissão.", "permissao");

  try {
    const saved = await prisma.usuario.update({
      where: { id },
      data: {
        nome: parsed.data.nome,
        usuario: parsed.data.usuario,
        ...(current.admin || !parsed.data.permissao ? {} : { permissao: parsed.data.permissao }),
        ...(parsed.data.senha
          ? {
              senhaHash: await hashPassword(parsed.data.senha),
              deveTrocarSenha: parsed.data.senha === SENHA_PADRAO,
            }
          : {}),
      },
    });
    if (current.usuario === actor.usuario) {
      await setSessionCookie({ usuario: saved.usuario, nome: saved.nome });
    }
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    const duplicate = duplicateMessage(error, "Já existe uma conta com esse usuário.");
    if (duplicate) return failure(duplicate, "usuario");
    console.error(error);
    return failure("Não foi possível salvar o usuário. Tente novamente.");
  }
}

export async function deleteUsuario(id: string) {
  const actor = await requireAdmin();
  const current = await prisma.usuario.findUnique({ where: { id }, select: { id: true, usuario: true, admin: true } });
  if (!current) return failure("Registro não encontrado.");
  if (current.admin || current.usuario === actor.usuario) {
    return failure("A conta de administrador não pode ser excluída.");
  }

  try {
    await prisma.usuario.delete({ where: { id } });
    revalidateApp();
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return failure("Não foi possível excluir o usuário. Tente novamente.");
  }
}
