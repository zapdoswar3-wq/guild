"use client";

import { useState } from "react";
import { CreateButton } from "@/components/shell/access";
import { createCatalogo, deleteCatalogo, updateCatalogo } from "@/actions/catalogo";
import { FilterBar } from "@/components/shell/filters";
import { errorOf, Field, FormDialog, TextInput } from "@/components/shell/form";
import { cellClass, headClass, PageHeader, RecordCount, StatGrid } from "@/components/shell/page-header";
import { ConfirmDelete, RowActions } from "@/components/shell/row-actions";
import { useSave } from "@/components/shell/use-save";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatDecimal, formatInteger } from "@/lib/format";
import type { CatalogoRow } from "@/lib/types";

export function CatalogoScreen({ rows }: { rows: CatalogoRow[] }) {
  const [form, setForm] = useState<CatalogoRow | "new" | null>(null);
  const [remove, setRemove] = useState<CatalogoRow | null>(null);
  const editing = form && form !== "new" ? form : null;
  const niveis = rows.reduce((sum, row) => sum + row.nivelMax, 0);

  return (
    <>
      <PageHeader
        section="SISTEMA"
        title="Configurações"
        description="Catálogo de talentos usado pelas guilds. O bônus e a unidade mostrados na tela de talentos vêm daqui."
      >
        <CreateButton label="Novo talento" onClick={() => setForm("new")} />
      </PageHeader>
      <StatGrid
        items={[
          { label: "Talentos no catálogo", value: formatInteger(rows.length) },
          { label: "Nível máximo somado", value: formatInteger(niveis) },
          { label: "Com bônus decimal", value: formatInteger(rows.filter((row) => !Number.isInteger(row.bonusPorNivel)).length) },
          { label: "Unidades distintas", value: formatInteger(new Set(rows.map((row) => row.unidade)).size) },
        ]}
      />
      <FilterBar placeholder="Buscar por nome, unidade ou descrição" />
      <div className="overflow-hidden rounded-xl border border-[#262A36] bg-[#1A1D27]">
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow>
              {["Nome", "Bônus por nível", "Unidade", "Nível máx.", "Descrição"].map((label) => (
                <TableHead key={label} className={headClass}>
                  {label}
                </TableHead>
              ))}
              <TableHead className={`${headClass} text-right`}>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm whitespace-normal text-[#8B91A7]">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className={`${cellClass} font-medium`}>{row.nome}</TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>{formatDecimal(row.bonusPorNivel)}</TableCell>
                  <TableCell className={`${cellClass} whitespace-normal`}>{row.unidade}</TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>{row.nivelMax}</TableCell>
                  <TableCell className={`${cellClass} whitespace-normal text-[#8B91A7]`}>{row.descricao}</TableCell>
                  <TableCell className={cellClass}>
                    <RowActions onEdit={() => setForm(row)} onDelete={() => setRemove(row)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <RecordCount count={rows.length} />
      {form ? <CatalogoDialog key={editing?.id ?? "novo"} talento={editing} onOpenChange={(open) => !open && setForm(null)} /> : null}
      <ConfirmDelete
        open={!!remove}
        onOpenChange={(open) => !open && setRemove(null)}
        extra="Os níveis deste talento nas guilds também serão apagados."
        successMessage="Talento excluído do catálogo."
        onConfirm={() => deleteCatalogo(remove!.id)}
      />
    </>
  );
}

function CatalogoDialog({
  talento,
  onOpenChange,
}: {
  talento: CatalogoRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { pending, errors, save } = useSave(() => onOpenChange(false));

  return (
    <FormDialog
      open
      onOpenChange={onOpenChange}
      title={talento ? "Editar talento" : "Novo talento"}
      description="Este cadastro define o bônus, a unidade e o nível máximo usados pelas guilds."
      pending={pending}
      onSubmit={(formData) =>
        save(
          () => (talento ? updateCatalogo(talento.id, formData) : createCatalogo(formData)),
          talento ? "Talento atualizado." : "Talento criado.",
        )
      }
    >
      <Field label="Nome" error={errorOf(errors, "nome")}>
        <TextInput name="nome" defaultValue={talento?.nome ?? ""} />
      </Field>
      <Field label="Bônus por nível" error={errorOf(errors, "bonusPorNivel")}>
        <TextInput name="bonusPorNivel" type="number" min={0} step="0.1" defaultValue={talento?.bonusPorNivel ?? 0} />
      </Field>
      <Field label="Unidade" error={errorOf(errors, "unidade")}>
        <TextInput name="unidade" defaultValue={talento?.unidade ?? ""} />
      </Field>
      <Field label="Nível máximo" error={errorOf(errors, "nivelMax")}>
        <TextInput name="nivelMax" type="number" min={1} step={1} defaultValue={talento?.nivelMax ?? 5} />
      </Field>
      <Field label="Descrição" className="grid gap-1.5 sm:col-span-2" error={errorOf(errors, "descricao")}>
        <Textarea name="descricao" defaultValue={talento?.descricao ?? ""} className="min-h-20 bg-[#0F1117]" />
      </Field>
    </FormDialog>
  );
}
