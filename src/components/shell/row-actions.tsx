"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useAccess } from "@/components/shell/access";

type ActionResult = { ok: true } | { ok: false; message: string };

export function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete?: () => void }) {
  const { canEdit, canDelete } = useAccess();
  const edit = canEdit ? onEdit : undefined;
  const remove = canDelete ? onDelete : undefined;
  if (!edit && !remove) return null;

  return (
    <div className="flex justify-end gap-1">
      {edit ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Editar" onClick={edit}>
              <Pencil />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Editar</TooltipContent>
        </Tooltip>
      ) : null}
      {remove ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Excluir" onClick={remove}>
              <Trash2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Excluir</TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
}

export function ConfirmDelete({
  open,
  onOpenChange,
  description = "Essa ação não pode ser desfeita.",
  extra,
  requireAck = false,
  ackLabel = "Confirmo a exclusão.",
  pendingLabel = "Excluindo...",
  successMessage,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description?: string;
  extra?: string;
  requireAck?: boolean;
  ackLabel?: string;
  pendingLabel?: string;
  successMessage: string;
  onConfirm: () => Promise<ActionResult>;
}) {
  const [pending, setPending] = useState(false);
  const [ack, setAck] = useState(false);

  useEffect(() => {
    if (open) setAck(false);
  }, [open]);

  async function confirm(event: React.MouseEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const result = await onConfirm();
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(successMessage);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível excluir o registro. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir este registro?</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
            {extra ? ` ${extra}` : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {requireAck ? (
          <label className="flex items-start gap-2 text-sm text-[#E6E8EF]">
            <input
              type="checkbox"
              className="mt-0.5 size-4 accent-[#6366F1]"
              checked={ack}
              onChange={(event) => setAck(event.target.checked)}
            />
            <span>{ackLabel}</span>
          </label>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending || (requireAck && !ack)} onClick={confirm}>
            {pending ? pendingLabel : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
