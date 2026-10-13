import { toDateInput } from "@/lib/dates";

const integer = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const percent = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export function formatInteger(value: number): string {
  return integer.format(value);
}

export function formatDecimal(value: number): string {
  return decimal.format(value);
}

export function formatPercent(value: number): string {
  return `${percent.format(value)}%`;
}

export function formatDate(value: string | Date): string {
  const iso = typeof value === "string" ? value : toDateInput(value);
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export function progressPercent(realizado: number, meta: number): number {
  if (meta <= 0) return 0;
  return Math.min(100, (realizado / meta) * 100);
}

export function occupationPercent(ativos: number, vagas: number): number {
  if (vagas <= 0) return 0;
  return (ativos / vagas) * 100;
}

export function bonusValor(nivel: number, bonusPorNivel: number): number {
  return Math.round(nivel * bonusPorNivel * 1000) / 1000;
}
