import { z } from "zod";
import {
  CARGOS,
  GUILD_STATUS,
  MEMBRO_STATUS,
  PRIORIDADES,
  TAREFA_STATUS,
  TIPOS_MISSAO,
  TIERS,
} from "@/lib/constants";
import { PERMISSOES, serializePermissoes } from "@/lib/permissions";

const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data.");
const optionalText = z.string().trim();
const optionalId = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value));

export const guildSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da guild.").max(80, "Nome muito longo."),
  lider: z.string().trim().min(2, "Informe o líder.").max(40, "Nome do líder muito longo."),
  tier: z.enum(TIERS, "Selecione o tier."),
  pontos: z.coerce.number().int("Use um número inteiro.").min(0, "Pontos não pode ser negativo."),
  bonusXp: z.coerce.number().min(0, "O bônus de XP não pode ser negativo."),
  vagas: z.coerce.number().int("Use um número inteiro.").min(1, "Informe ao menos 1 vaga."),
  status: z.enum(GUILD_STATUS, "Selecione o status."),
  criadaEm: dateField,
  observacoes: optionalText.max(500, "Observações muito longas."),
});

export const membroSchema = z.object({
  nick: z.string().trim().min(2, "Informe o nick.").max(32, "Nick muito longo."),
  guildId: z.string().trim().min(1, "Selecione a guild."),
  cargo: z.enum(CARGOS, "Selecione o cargo."),
  nivel: z.coerce.number().int("Use um número inteiro.").min(1, "O nível precisa ser pelo menos 1."),
  pontos: z.coerce.number().int("Use um número inteiro.").min(0, "Pontos não pode ser negativo."),
  entrada: dateField,
  status: z.enum(MEMBRO_STATUS, "Selecione o status."),
  discord: optionalText.max(40, "Discord muito longo."),
});

export const talentoGuildSchema = z.object({
  guildId: z.string().trim().min(1, "Selecione a guild."),
  talentoId: z.string().trim().min(1, "Selecione o talento."),
  nivel: z.coerce.number().int("Use um número inteiro.").min(0, "O nível não pode ser negativo."),
});

export const objetivoSchema = z.object({
  guildId: z.string().trim().min(1, "Selecione a guild."),
  titulo: z.string().trim().min(3, "Informe o título.").max(120, "Título muito longo."),
  responsavelId: optionalId,
  meta: z.coerce.number().positive("A meta precisa ser maior que zero."),
  realizado: z.coerce.number().min(0, "O realizado não pode ser negativo."),
  prazo: dateField,
  prioridade: z.enum(PRIORIDADES, "Selecione a prioridade."),
  recompensa: optionalText.max(120, "Recompensa muito longa."),
  notas: optionalText.max(500, "Notas muito longas."),
});

export const cacadaSchema = z.object({
  data: dateField,
  guildId: z.string().trim().min(1, "Selecione a guild."),
  alvo: z.string().trim().min(2, "Informe o Pokémon alvo.").max(60, "Alvo muito longo."),
  rota: optionalText.max(60, "Rota muito longa."),
  responsavelId: optionalId,
  meta: z.coerce.number().int("Use um número inteiro.").positive("A meta precisa ser maior que zero."),
  realizado: z.coerce.number().int("Use um número inteiro.").min(0, "O realizado não pode ser negativo."),
  status: z.enum(TAREFA_STATUS, "Selecione o status."),
  pontos: z.coerce.number().int("Use um número inteiro.").min(0, "Pontos não pode ser negativo."),
  obs: optionalText.max(500, "Observação muito longa."),
});

export const missaoSchema = z.object({
  data: dateField,
  guildId: z.string().trim().min(1, "Selecione a guild."),
  titulo: z.string().trim().min(3, "Informe o título.").max(120, "Título muito longo."),
  tipo: z.enum(TIPOS_MISSAO, "Selecione o tipo."),
  responsavelIds: z.array(z.string().trim().min(1)).default([]),
  prioridade: z.enum(PRIORIDADES, "Selecione a prioridade."),
  status: z.enum(TAREFA_STATUS, "Selecione o status."),
  pontos: z.coerce.number().int("Use um número inteiro.").min(0, "Pontos não pode ser negativo."),
  xp: z.coerce.number().int("Use um número inteiro.").min(0, "O XP não pode ser negativo."),
  obs: optionalText.max(500, "Observação muito longa."),
});

const usuarioLogin = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Informe o usuário.")
  .max(32, "Usuário muito longo.")
  .regex(/^[a-z0-9._-]+$/, "Use letras, números, ponto, hífen ou sublinhado.");

const nomeUsuario = z.string().trim().min(2, "Informe o nome.").max(80, "Nome muito longo.");

const senhaNova = z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(72, "Senha muito longa.");

const permissoesField = z.array(z.enum(PERMISSOES, "Permissão inválida.")).transform((items) => serializePermissoes(items));

export const usuarioCreateSchema = z.object({
  nome: nomeUsuario,
  usuario: usuarioLogin,
  permissoes: permissoesField,
});

export const usuarioUpdateSchema = z.object({
  nome: nomeUsuario,
  usuario: usuarioLogin,
  permissoes: permissoesField,
  senha: z
    .string()
    .max(72, "Senha muito longa.")
    .refine((value) => value.length === 0 || value === "123456" || value.length >= 8, "A senha precisa ter pelo menos 8 caracteres."),
});

export const definirSenhaSchema = z
  .object({
    senha: senhaNova.refine((value) => value !== "123456", "Escolha uma senha diferente da senha padrão."),
    confirmacao: z.string(),
  })
  .refine((value) => value.senha === value.confirmacao, {
    message: "A confirmação não confere com a nova senha.",
    path: ["confirmacao"],
  });

export const catalogoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do talento.").max(80, "Nome muito longo."),
  bonusPorNivel: z.coerce.number().min(0, "O bônus por nível não pode ser negativo."),
  unidade: z.string().trim().min(1, "Informe a unidade.").max(80, "Unidade muito longa."),
  nivelMax: z.coerce.number().int("Use um número inteiro.").min(1, "O nível máximo precisa ser pelo menos 1."),
  descricao: z.string().trim().min(3, "Informe a descrição.").max(240, "Descrição muito longa."),
});
