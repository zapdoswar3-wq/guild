import { DateFilter } from "@/components/shell/filters";
import { StatusBadge } from "@/components/shell/badges";
import { cellClass, headClass, PageHeader, RecordCount, StatGrid } from "@/components/shell/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { isISODate, todayISO } from "@/lib/dates";
import { readFilters } from "@/lib/filters";
import { formatDate, formatDecimal, formatInteger, formatPercent } from "@/lib/format";
import { getOverview } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function VisaoGeralPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = readFilters(await searchParams);
  const data = isISODate(filters.data) ? filters.data : todayISO();
  const overview = await getOverview(data);

  return (
    <>
      <PageHeader
        section="GESTÃO"
        title="Visão geral"
        description={`Desempenho das guilds em ${formatDate(overview.data)}. Os pontos só entram quando a missão ou a caçada está concluída.`}
      >
        <DateFilter fallback={data} />
      </PageHeader>
      <StatGrid
        items={[
          {
            label: "Guilds",
            value: formatInteger(overview.cards.guildsAtivas + overview.cards.guildsRecrutando),
            hint: `${formatInteger(overview.cards.guildsAtivas)} ativas · ${formatInteger(overview.cards.guildsRecrutando)} recrutando`,
          },
          { label: "Membros ativos", value: formatInteger(overview.cards.membrosAtivos) },
          { label: "Tarefas concluídas", value: formatPercent(overview.cards.percentualTarefas), hint: "Missões e caçadas do dia" },
          { label: "Pontos ganhos no dia", value: formatInteger(overview.cards.pontosDia) },
        ]}
      />
      <div className="mb-6 grid gap-3 lg:grid-cols-2">
        <AlertList title="Missões pendentes" empty="Nenhuma missão pendente neste dia." items={overview.pendentes} />
        <AlertList title="Missões que falharam" empty="Nenhuma missão falhou neste dia." items={overview.falhas} />
      </div>
      <div className="overflow-hidden rounded-xl border border-[#262A36] bg-[#1A1D27]">
        <div className="border-b border-[#262A36] px-4 py-3">
          <h2 className="text-sm font-semibold text-[#E6E8EF]">Desempenho das guilds no dia</h2>
        </div>
        <Table className="min-w-[1200px]">
          <TableHeader>
            <TableRow>
              {[
                "Guild",
                "Tier",
                "Status",
                "Membros",
                "Pontos",
                "Bônus XP",
                "Objetivos abertos",
                "Missões",
                "Caçadas",
                "Conclusão",
                "Pontos no dia",
              ].map((label) => (
                <TableHead key={label} className={headClass}>
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {overview.guilds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="py-12 text-center text-sm whitespace-normal text-[#8B91A7]">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              overview.guilds.map((guild) => (
                <TableRow key={guild.id}>
                  <TableCell className={`${cellClass} font-medium`}>{guild.nome}</TableCell>
                  <TableCell className={cellClass}>{guild.tier}</TableCell>
                  <TableCell className={cellClass}>
                    <StatusBadge value={guild.status} />
                  </TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>{formatInteger(guild.membros)}</TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>{formatInteger(guild.pontos)}</TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>{formatDecimal(guild.bonusXp)}%</TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>{formatInteger(guild.objetivosAbertos)}</TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>
                    {formatInteger(guild.missoesFeitas)}/{formatInteger(guild.missoesTotal)}
                  </TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>
                    {formatInteger(guild.cacadasFeitas)}/{formatInteger(guild.cacadasTotal)}
                  </TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>
                    {guild.conclusao === null ? "—" : formatPercent(guild.conclusao)}
                  </TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>{formatInteger(guild.pontosDia)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <RecordCount count={overview.guilds.length} />
    </>
  );
}

function AlertList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: { id: string; titulo: string; guild: string }[];
}) {
  return (
    <article className="rounded-xl border border-[#262A36] bg-[#1A1D27] p-4">
      <h2 className="text-sm font-semibold text-[#E6E8EF]">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-[#8B91A7]">{empty}</p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#E6E8EF]">{item.titulo}</span>
              <span className="shrink-0 text-[#8B91A7]">{item.guild}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
