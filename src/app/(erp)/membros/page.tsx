import { MembrosScreen } from "@/components/screens/membros-screen";
import { readFilters } from "@/lib/filters";
import { getMembroPage, getOptions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function MembrosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = readFilters(await searchParams);
  const [page, options] = await Promise.all([getMembroPage(filters), getOptions()]);
  return <MembrosScreen page={page} options={options} />;
}
