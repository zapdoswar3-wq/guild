import { MissoesScreen } from "@/components/screens/missoes-screen";
import { isISODate, todayISO } from "@/lib/dates";
import { readFilters } from "@/lib/filters";
import { getMissaoPage, getOptions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function MissoesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = readFilters(await searchParams);
  const data = isISODate(filters.data) ? filters.data : todayISO();
  const [page, options] = await Promise.all([getMissaoPage(filters, data), getOptions()]);
  return <MissoesScreen page={page} options={options} data={data} />;
}
