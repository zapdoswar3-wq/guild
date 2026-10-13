import { AccessProvider } from "@/components/shell/access";
import { AppShell } from "@/components/shell/app-shell";
import { accessFrom, permissaoLabel } from "@/lib/permissions";
import { requireUser } from "@/lib/session";

export default async function ErpLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();
  return (
    <AppShell usuario={session.usuario} admin={session.admin} papel={permissaoLabel(session)}>
      <AccessProvider access={accessFrom(session)}>{children}</AccessProvider>
    </AppShell>
  );
}
