"use client";

import { useState } from "react";
import { toast } from "sonner";

type ActionResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export type FieldErrors = Record<string, string[]>;

export function useSave(onDone: () => void) {
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  async function save(run: () => Promise<ActionResult>, success: string) {
    setPending(true);
    try {
      const result = await run();
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.message);
        return;
      }
      setErrors({});
      toast.success(success);
      onDone();
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível concluir a operação. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return { pending, errors, save };
}

export function fieldError(errors: FieldErrors, name: string) {
  return errors[name]?.[0];
}
