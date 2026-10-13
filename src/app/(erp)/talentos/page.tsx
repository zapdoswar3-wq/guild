import { TalentosScreen } from "@/components/screens/talentos-screen";
import { readFilters } from "@/lib/filters";
import { getOptions, getTalentoPage } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function TalentosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = readFilters(await searchParams);
  const [page, options] = await Promise.all([getTalentoPage(filters), getOptions()]);
  return <TalentosScreen page={page} options={options} />;
}
