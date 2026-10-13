export type Filters = {
  q?: string;
  guild?: string;
  status?: string;
  data?: string;
};

function first(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const text = raw?.trim();
  return text ? text : undefined;
}

export function readFilters(
  params: Record<string, string | string[] | undefined>,
): Filters {
  return {
    q: first(params.q),
    guild: first(params.guild),
    status: first(params.status),
    data: first(params.data),
  };
}

export function matches(query: string | undefined, ...parts: Array<string | null | undefined>): boolean {
  if (!query) return true;
  const needle = query.toLocaleLowerCase("pt-BR");
  return parts.some((part) => (part ?? "").toLocaleLowerCase("pt-BR").includes(needle));
}
