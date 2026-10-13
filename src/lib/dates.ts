export const TIME_ZONE = "America/Sao_Paulo";

export function todayISO(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function isISODate(value: string | undefined | null): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function toDateInput(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateInput(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function shiftISO(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  return toDateInput(new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0)));
}

export function dayBounds(iso: string): { gte: Date; lte: Date } {
  const [year, month, day] = iso.split("-").map(Number);
  return {
    gte: new Date(Date.UTC(year, month - 1, day, 0, 0, 0)),
    lte: new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)),
  };
}

export function isPastDate(date: Date, today = todayISO()): boolean {
  return toDateInput(date) < today;
}
