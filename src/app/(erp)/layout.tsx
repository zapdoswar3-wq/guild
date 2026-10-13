import { AppShell } from "@/components/shell/app-shell";
import { requireUser } from "@/lib/session";

export default async function ErpLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();
  return (
    <AppShell usuario={session.usuario} admin={session.admin}>
      {children}
    </AppShell>
  );
}
