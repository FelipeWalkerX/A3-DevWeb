"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/correcao", label: "Correção com IA" },
  { href: "/questoes/nova", label: "Nova questão" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { usuario, sair } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-6">
          <Link href="/dashboard" className="text-lg font-semibold text-emerald-800">
            Clareia
          </Link>
          <nav className="flex flex-wrap gap-1 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 ${
                  pathname === link.href
                    ? "bg-emerald-50 font-medium text-emerald-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>{usuario?.nome}</span>
          <button onClick={sair} className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50">
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
