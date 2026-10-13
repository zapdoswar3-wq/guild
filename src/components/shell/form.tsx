"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MemberOption } from "@/lib/types";
import type { FieldErrors } from "@/components/shell/use-save";

export function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className ?? "grid gap-1.5"}>
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}

export function EnumSelect({
  name,
  value,
  onChange,
  options,
  placeholder = "Selecione",
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[] | { value: string; label: string }[];
  placeholder?: string;
}) {
  const items = options.map((option) => (typeof option === "string" ? { value: option, label: option } : option));
  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-[#0F1117]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

export function MemberSelect({
  guildId,
  members,
  value,
  onChange,
}: {
  guildId: string;
  members: MemberOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const options = members.filter((member) => member.guildId === guildId);
  return (
    <>
      <input type="hidden" name="responsavelId" value={value} />
      <Select
        value={value || "__none__"}
        onValueChange={(next) => onChange(next === "__none__" ? "" : next)}
        disabled={!guildId}
      >
        <SelectTrigger className="w-full bg-[#0F1117]">
          <SelectValue placeholder={guildId ? "Sem responsável" : "Selecione a guild primeiro"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">Sem responsável</SelectItem>
          {options.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              {member.status === "Ativo" ? member.nick : `${member.nick} (${member.status})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  pending,
  onSubmit,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  pending: boolean;
  onSubmit: (formData: FormData) => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <form
          className="grid gap-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(new FormData(event.currentTarget));
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">{children}</div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TextInput(props: React.ComponentProps<typeof Input>) {
  return <Input className="bg-[#0F1117]" {...props} />;
}

export function errorOf(errors: FieldErrors, name: string) {
  return errors[name]?.[0];
}
