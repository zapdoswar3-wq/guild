import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { failure, type ActionResult } from "@/lib/action-utils";
import { accessFrom } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { createSessionToken, readSessionToken, SESSION_COOKIE, type SessionUser } from "@/lib/session-token";

const WEEK = 60 * 60 * 24 * 7;

export async function setSessionCookie(user: SessionUser) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: WEEK,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete({ name: SESSION_COOKIE, path: "/" });
}

export async function getSession() {
  const jar = await cookies();
  return readSessionToken(jar.get(SESSION_COOKIE)?.value);
}

async function loadUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.usuario.findUnique({
    where: { usuario: session.usuario },
    select: { id: true, usuario: true, nome: true, admin: true, permissao: true, deveTrocarSenha: true },
  });
  if (!user) {
    await clearSessionCookie();
    return null;
  }
  return user;
}

export async function requireUser() {
  const user = await loadUser();
  if (!user) redirect("/");
  if (user.deveTrocarSenha) redirect("/definir-senha");
  return user;
}

export async function requirePasswordChange() {
  const user = await loadUser();
  if (!user) redirect("/");
  if (!user.deveTrocarSenha) redirect("/visao-geral");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user.admin) redirect("/visao-geral");
  return user;
}

export async function assertCan(kind: "create" | "edit" | "delete"): Promise<ActionResult | null> {
  const user = await requireUser();
  const access = accessFrom(user);
  if (kind === "edit" && !access.canEdit) return failure("Sua permissão permite somente visualizar.");
  if (kind === "create" && !access.canCreate) return failure("Sua permissão não permite incluir registros.");
  if (kind === "delete" && !access.canDelete) return failure("Sua permissão não permite excluir registros.");
  return null;
}
