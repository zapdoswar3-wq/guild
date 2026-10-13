import { isPastDate, todayISO } from "@/lib/dates";

export type ObjetivoStatus = "Concluído" | "Atrasado" | "Em andamento" | "Pendente";

export function objetivoStatus(
  objetivo: { realizado: number; meta: number; prazo: Date },
  today = todayISO(),
): ObjetivoStatus {
  if (objetivo.meta > 0 && objetivo.realizado >= objetivo.meta) return "Concluído";
  if (isPastDate(objetivo.prazo, today)) return "Atrasado";
  if (objetivo.realizado > 0) return "Em andamento";
  return "Pendente";
}

export function pontosContabilizados(status: string, pontos: number): number {
  return status === "Concluída" ? pontos : 0;
}

export function isTarefaAberta(status: string): boolean {
  return status === "Pendente" || status === "Em andamento";
}

type Tone = "green" | "blue" | "amber" | "red" | "gray";

const TONES: Record<Tone, string> = {
  green: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  blue: "border-sky-500/30 bg-sky-500/15 text-sky-300",
  amber: "border-amber-500/30 bg-amber-500/15 text-amber-300",
  red: "border-red-500/30 bg-red-500/15 text-red-300",
  gray: "border-zinc-500/30 bg-zinc-500/15 text-zinc-300",
};

export function statusTone(status: string): string {
  if (["Concluída", "Concluído", "Ativo", "Ativa", "Administrador", "Liberado", "Excluir"].includes(status)) return TONES.green;
  if (["Em andamento", "Recrutando", "Editar"].includes(status)) return TONES.blue;
  if (["Pendente", "Afastado", "Incluir"].includes(status)) return TONES.amber;
  if (["Falhou", "Atrasado"].includes(status)) return TONES.red;
  return TONES.gray;
}

export function priorityTone(prioridade: string): string {
  if (prioridade === "Alta") return TONES.red;
  if (prioridade === "Média") return TONES.amber;
  return TONES.blue;
}
