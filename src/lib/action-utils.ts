import { Prisma } from "@prisma/client";
import { flattenError, type ZodType } from "zod";
import { revalidatePath } from "next/cache";

export type FieldErrors = Record<string, string[]>;

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: FieldErrors };

const PATHS = [
  "/visao-geral",
  "/missoes",
  "/cacadas",
  "/objetivos",
  "/guilds",
  "/membros",
  "/talentos",
  "/configuracoes",
  "/usuarios",
];

export function revalidateApp() {
  for (const path of PATHS) revalidatePath(path);
}

export function formDataToObject(formData: FormData): Record<string, string> {
  const data: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") data[key] = value;
  }
  return data;
}

export function parseInput<T>(
  schema: ZodType<T>,
  input: unknown,
): { ok: true; data: T } | { ok: false; message: string; fieldErrors: FieldErrors } {
  const parsed = schema.safeParse(input);
  if (parsed.success) return { ok: true, data: parsed.data };

  const flat = flattenError(parsed.error);
  const fieldErrors: FieldErrors = {};
  for (const [key, messages] of Object.entries(flat.fieldErrors ?? {})) {
    if (!Array.isArray(messages)) continue;
    const texts = messages.filter((item): item is string => typeof item === "string" && item.length > 0);
    if (texts.length) fieldErrors[key] = texts;
  }

  return {
    ok: false,
    message: "Verifique os campos destacados.",
    fieldErrors,
  };
}

export function duplicateMessage(error: unknown, message: string): string | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return message;
  }
  return null;
}

export function failure(message: string, field?: string): ActionResult {
  return field
    ? { ok: false, message, fieldErrors: { [field]: [message] } }
    : { ok: false, message };
}
