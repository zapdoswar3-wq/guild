"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { clearAttempts, registerAttempt } from "@/lib/login-limit";
import { prisma } from "@/lib/prisma";
import { hashPassword, SENHA_PADRAO, verifyPassword } from "@/lib/password";
import { clearSessionCookie, requirePasswordChange, setSessionCookie } from "@/lib/session";
import { definirSenhaSchema } from "@/lib/validators";
import { formDataToObject, parseInput } from "@/lib/action-utils";

const DUMMY_HASH = `${"ab".repeat(16)}:${"00".repeat(32)}`;

async function attemptKey(usuario: string) {
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-real-ip")?.trim() || requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return `${ip}:${usuario}`;
}

export async function login(_prev: { message: string } | null, formData: FormData) {
  const usuario = String(formData.get("usuario") ?? "").trim().toLowerCase().slice(0, 32);
  const senha = String(formData.get("senha") ?? "");

  if (!usuario || !senha) {
    return { message: "Informe o usuário e a senha." };
  }
  if (senha.length > 72) {
    return { message: "Usuário ou senha inválidos." };
  }

  const key = await attemptKey(usuario);
  if (registerAttempt(key)) {
    return { message: "Muitas tentativas. Espere alguns minutos e tente de novo." };
  }

  let nextPath = "/visao-geral";
  try {
    const user = await prisma.usuario.findUnique({ where: { usuario } });
    const valid = await verifyPassword(senha, user?.senhaHash ?? DUMMY_HASH);
    if (!user || !valid) {
      return { message: "Usuário ou senha inválidos." };
    }

    clearAttempts(key);
    await setSessionCookie({ usuario: user.usuario, nome: user.nome });
    nextPath = user.deveTrocarSenha ? "/definir-senha" : "/visao-geral";
  } catch (error) {
    console.error(error);
    return { message: "Não foi possível entrar agora. Tente novamente mais tarde." };
  }

  redirect(nextPath);
}

export async function definirSenha(_prev: { message: string } | null, formData: FormData) {
  const user = await requirePasswordChange();
  const parsed = parseInput(definirSenhaSchema, formDataToObject(formData));
  if (!parsed.ok) {
    return { message: parsed.fieldErrors.confirmacao?.[0] ?? parsed.fieldErrors.senha?.[0] ?? parsed.message };
  }
  if (parsed.data.senha === SENHA_PADRAO) {
    return { message: "Escolha uma senha diferente da senha padrão." };
  }

  await prisma.usuario.update({
    where: { id: user.id },
    data: { senhaHash: await hashPassword(parsed.data.senha), deveTrocarSenha: false },
  });
  redirect("/visao-geral");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/");
}
