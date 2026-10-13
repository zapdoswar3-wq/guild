import { ObjetivosScreen } from "@/components/screens/objetivos-screen";
import { readFilters } from "@/lib/filters";
import { getObjetivoPage, getOptions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ObjetivosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = readFilters(await searchParams);
  const [page, options] = await Promise.all([getObjetivoPage(filters), getOptions()]);
  return <ObjetivosScreen page={page} options={options} />;
}
