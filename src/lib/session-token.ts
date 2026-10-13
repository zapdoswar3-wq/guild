export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-guild_session" : "guild_session";

export type SessionUser = {
  usuario: string;
  nome: string;
};

const encoder = new TextEncoder();

function secret() {
  const value = process.env.AUTH_SECRET?.trim() ?? "";
  if (value.length >= 32) return value;
  if (process.env.NODE_ENV === "production") return null;
  return "guild-erp-local-dev-secret";
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string) {
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const binary = atob(value.replaceAll("-", "+").replaceAll("_", "/") + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function sign(value: string) {
  const current = secret();
  if (!current) return null;
  const key = await crypto.subtle.importKey("raw", encoder.encode(current), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

function sameSignature(left: string, right: string) {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(user: SessionUser) {
  const payload = toBase64Url(
    encoder.encode(
      JSON.stringify({
        usuario: user.usuario,
        nome: user.nome,
        exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
      }),
    ),
  );
  const signature = await sign(payload);
  if (!signature) throw new Error("AUTH_SECRET ausente ou curto demais.");
  return `${payload}.${signature}`;
}

export async function readSessionToken(token: string | undefined | null): Promise<SessionUser | null> {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || token.split(".").length !== 2) return null;
  const expected = await sign(payload);
  if (!expected || !sameSignature(signature, expected)) return null;

  try {
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as {
      usuario?: string;
      nome?: string;
      exp?: number;
    };
    if (!data.usuario || !data.nome || typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return { usuario: data.usuario, nome: data.nome };
  } catch {
    return null;
  }
}
