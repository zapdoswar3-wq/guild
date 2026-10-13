"use client";

import { Plus } from "lucide-react";
import { createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import type { Access } from "@/lib/permissions";

const AccessContext = createContext<Access>({ canView: false, canEdit: false, canCreate: false, canDelete: false });

export function AccessProvider({ access, children }: { access: Access; children: React.ReactNode }) {
  return <AccessContext.Provider value={access}>{children}</AccessContext.Provider>;
}

export function useAccess() {
  return useContext(AccessContext);
}

export function CreateButton({ label, onClick }: { label: string; onClick: () => void }) {
  const { canCreate } = useAccess();
  if (!canCreate) return null;
  return (
    <Button onClick={onClick}>
      <Plus />
      {label}
    </Button>
  );
}
