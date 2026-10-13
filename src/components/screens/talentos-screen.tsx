"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { createTalentoGuild, deleteTalentoGuild, updateTalentoGuild } from "@/actions/talentos";
import { ProgressBar } from "@/components/shell/badges";
import { FilterBar } from "@/components/shell/filters";
import { EnumSelect, errorOf, Field, FormDialog, TextInput } from "@/components/shell/form";
import { cellClass, headClass, PageHeader, RecordCount, StatGrid } from "@/components/shell/page-header";
import { ConfirmDelete, RowActions } from "@/components/shell/row-actions";
import { useSave } from "@/components/shell/use-save";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TALENTO_NIVEL_STATUS } from "@/lib/constants";
import { bonusValor, formatDecimal, formatInteger } from "@/lib/format";
import type { AppOptions, TalentoPage, TalentoRow } from "@/lib/types";

export function TalentosScreen({ page, options }: { page: TalentoPage; options: AppOptions }) {
  const [form, setForm] = useState<TalentoRow | "new" | null>(null);
  const [remove, setRemove] = useState<TalentoRow | null>(null);
  const editing = form && form !== "new" ? form : null;

  return (
    <>
      <PageHeader
        section="CADASTROS"
        title="Talentos"
        description="Nível de cada talento por guild. O bônus atual é nível × bônus por nível do catálogo."
      >
        <Button onClick={() => setForm("new")}>
          <Plus />
          Novo talento
        </Button>
      </PageHeader>
      <StatGrid
        items={[
          { label: "Talentos registrados", value: formatInteger(page.summary.total) },
          { label: "Níveis somados", value: formatInteger(page.summary.niveis) },
          { label: "No nível máximo", value: formatInteger(page.summary.noMaximo) },
          { label: "Ainda no nível 0", value: formatInteger(page.summary.noZero) },
        ]}
      />
      <FilterBar
        placeholder="Buscar por talento, guild ou descrição"
        guilds={options.guilds}
        statuses={TALENTO_NIVEL_STATUS}
      />
      <div className="overflow-hidden rounded-xl border border-[#262A36] bg-[#1A1D27]">
        <Table className="min-w-[1040px]">
          <TableHeader>
            <TableRow>
              {["Guild", "Talento", "Nível", "Progresso", "Bônus atual", "Próximo nível", "Unidade"].map((label) => (
                <TableHead key={label} className={headClass}>
                  {label}
                </TableHead>
              ))}
              <TableHead className={`${headClass} text-right`}>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {page.rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-sm whitespace-normal text-[#8B91A7]">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              page.rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className={cellClass}>{item.guildNome}</TableCell>
                  <TableCell className={`${cellClass} whitespace-normal`}>
                    <p className="font-medium">{item.talentoNome}</p>
                    <p className="max-w-xs text-xs text-[#8B91A7]">{item.descricao}</p>
                  </TableCell>
                  <TableCell className={cellClass}>Nv {item.nivel}/{item.nivelMax}</TableCell>
                  <TableCell className={cellClass}>
                    <ProgressBar value={item.progresso} />
                  </TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>{formatDecimal(item.bonusAtual)}</TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>
                    {item.bonusProximo === null ? "Máximo" : formatDecimal(item.bonusProximo)}
                  </TableCell>
                  <TableCell className={`${cellClass} whitespace-normal text-[#8B91A7]`}>{item.unidade}</TableCell>
                  <TableCell className={cellClass}>
                    <RowActions onEdit={() => setForm(item)} onDelete={() => setRemove(item)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <RecordCount count={page.rows.length} />
      {form ? (
        <TalentoDialog
          key={editing?.id ?? "novo"}
          talento={editing}
          options={options}
          onOpenChange={(open) => !open && setForm(null)}
        />
      ) : null}
      <ConfirmDelete
        open={!!remove}
        onOpenChange={(open) => !open && setRemove(null)}
        successMessage="Talento excluído."
        onConfirm={() => deleteTalentoGuild(remove!.id)}
      />
    </>
  );
}

function TalentoDialog({
  talento,
  options,
  onOpenChange,
}: {
  talento: TalentoRow | null;
  options: AppOptions;
  onOpenChange: (open: boolean) => void;
}) {
  const { pending, errors, save } = useSave(() => onOpenChange(false));
  const [guildId, setGuildId] = useState(talento?.guildId ?? options.guilds[0]?.id ?? "");
  const [talentoId, setTalentoId] = useState(talento?.talentoId ?? options.talentos[0]?.id ?? "");
  const [nivel, setNivel] = useState(String(talento?.nivel ?? 0));
  const catalogo = options.talentos.find((item) => item.id === talentoId);
  const nivelNum = Number(nivel);
  const nivelSeguro = Number.isFinite(nivelNum) ? nivelNum : 0;
  const bonusAtual = catalogo ? bonusValor(nivelSeguro, catalogo.bonusPorNivel) : 0;
  const noMaximo = catalogo ? nivelSeguro >= catalogo.nivelMax : false;
  const progresso = catalogo && catalogo.nivelMax > 0 ? Math.min(100, (nivelSeguro / catalogo.nivelMax) * 100) : 0;

  return (
    <FormDialog
      open
      onOpenChange={onOpenChange}
      title={talento ? "Editar talento" : "Novo talento"}
      description="Cada par de guild e talento pode ser registrado uma única vez."
      pending={pending}
      onSubmit={(formData) =>
        save(
          () => (talento ? updateTalentoGuild(talento.id, formData) : createTalentoGuild(formData)),
          talento ? "Talento atualizado." : "Talento registrado.",
        )
      }
    >
      <Field label="Guild" error={errorOf(errors, "guildId")}>
        <EnumSelect
          name="guildId"
          value={guildId}
          onChange={setGuildId}
          options={options.guilds.map((guild) => ({ value: guild.id, label: guild.nome }))}
        />
      </Field>
      <Field label="Talento" error={errorOf(errors, "talentoId")}>
        <EnumSelect
          name="talentoId"
          value={talentoId}
          onChange={setTalentoId}
          options={options.talentos.map((item) => ({ value: item.id, label: item.nome }))}
        />
      </Field>
      <Field label="Nível" error={errorOf(errors, "nivel")} className="grid gap-1.5 sm:col-span-2">
        <TextInput
          name="nivel"
          type="number"
          min={0}
          max={catalogo?.nivelMax}
          step={1}
          value={nivel}
          onChange={(event) => setNivel(event.target.value)}
        />
      </Field>
      {catalogo ? (
        <div className="grid gap-2 rounded-lg border border-[#262A36] bg-[#0F1117] p-3 text-sm sm:col-span-2">
          <p>
            Nv {Number.isFinite(nivelNum) ? nivelNum : 0}/{catalogo.nivelMax} · {formatDecimal(progresso)}%
          </p>
          <p>
            Bônus atual: <span className="text-[#E6E8EF]">{formatDecimal(bonusAtual)}</span> {catalogo.unidade}
          </p>
          <p>
            Próximo nível:{" "}
            <span className="text-[#E6E8EF]">
              {noMaximo ? "Máximo" : formatDecimal(bonusValor(nivelSeguro + 1, catalogo.bonusPorNivel))}
            </span>
          </p>
          <p className="text-[#8B91A7]">{catalogo.descricao}</p>
        </div>
      ) : null}
    </FormDialog>
  );
}
