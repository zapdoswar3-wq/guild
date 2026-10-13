import { CacadasScreen } from "@/components/screens/cacadas-screen";
import { isISODate, todayISO } from "@/lib/dates";
import { readFilters } from "@/lib/filters";
import { getCacadaPage, getOptions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CacadasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = readFilters(await searchParams);
  const data = isISODate(filters.data) ? filters.data : todayISO();
  const [page, options] = await Promise.all([getCacadaPage(filters, data), getOptions()]);
  return <CacadasScreen page={page} options={options} data={data} />;
}
