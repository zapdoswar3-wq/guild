"use client";

import { CircleHelp, Crosshair, Flag, LayoutDashboard, Settings, Shield, Sparkles, Swords, UserRound, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

const NAV: { label: string; items: { href: string; label: string; icon: LucideIcon; adminOnly?: boolean }[] }[] = [
  {
    label: "GESTÃO",
    items: [
      { href: "/visao-geral", label: "Visão geral", icon: LayoutDashboard },
      { href: "/missoes", label: "Missões diárias", icon: Swords },
      { href: "/cacadas", label: "Caçadas diárias", icon: Crosshair },
      { href: "/objetivos", label: "Objetivos", icon: Flag },
    ],
  },
  {
    label: "CADASTROS",
    items: [
      { href: "/guilds", label: "Guilds", icon: Shield },
      { href: "/membros", label: "Membros", icon: Users },
      { href: "/talentos", label: "Talentos", icon: Sparkles },
    ],
  },
  {
    label: "SISTEMA",
    items: [
      { href: "/usuarios", label: "Usuários", icon: UserRound, adminOnly: true },
      { href: "/configuracoes", label: "Configurações", icon: Settings },
      { href: "/ajuda", label: "Ajuda", icon: CircleHelp },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children, usuario, admin }: { children: React.ReactNode; usuario: string; admin: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#0F1117] text-[#E6E8EF]">
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#262A36] bg-[#151821] transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex items-center gap-3 border-b border-[#262A36] px-4 py-5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#6366F1] text-white">
            <Shield className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm leading-tight font-semibold tracking-tight text-[#E6E8EF]">Unbroken Guild System</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV.map((section) => (
            <div key={section.label} className="mb-5">
              <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.16em] text-[#8B91A7]">{section.label}</p>
              <div className="grid gap-1">
                {section.items.filter((item) => !item.adminOnly || admin).map((item) => {
                  const active = isActive(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-[#252848] font-medium text-[#C7C9FF]"
                          : "text-[#8B91A7] hover:bg-white/5 hover:text-[#E6E8EF]",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-[#262A36] px-4 py-4">
          <p className="text-xs text-[#8B91A7]">
            Conectado como <span className="font-medium text-[#E6E8EF]">{usuario}</span>
          </p>
          <form action={logout} className="mt-2">
            <button type="submit" className="text-xs font-medium text-[#8B91A7] hover:text-[#E6E8EF]">
              Sair
            </button>
          </form>
          <p className="mt-3 text-xs font-medium text-emerald-400">● Sistema disponível</p>
        </div>
      </aside>
      <div className="min-h-screen md:pl-64">
        <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[#262A36] bg-[#0F1117]/95 px-4 backdrop-blur md:hidden">
          <Button variant="ghost" size="icon" aria-label="Abrir menu" onClick={() => setOpen(true)}>
            <Menu />
          </Button>
          <span className="text-sm font-semibold">Unbroken Guild System</span>
        </div>
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
