import { CatalogoScreen } from "@/components/screens/catalogo-screen";
import { readFilters } from "@/lib/filters";
import { getCatalogo } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = readFilters(await searchParams);
  const rows = await getCatalogo(filters);
  return <CatalogoScreen rows={rows} />;
}
