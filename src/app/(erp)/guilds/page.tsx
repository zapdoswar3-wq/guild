import { GuildsScreen } from "@/components/screens/guilds-screen";
import { readFilters } from "@/lib/filters";
import { getGuildPage, getOptions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function GuildsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = readFilters(await searchParams);
  const [page, options] = await Promise.all([getGuildPage(filters), getOptions()]);
  return <GuildsScreen page={page} guilds={options.guilds} />;
}
