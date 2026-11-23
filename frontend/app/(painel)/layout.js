"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

// Todas as páginas dentro de (painel) só abrem com usuário logado
export default function PainelLayout({ children }) {
  const router = useRouter();
  const { usuario, carregado } = useAuth();

  useEffect(() => {
    if (carregado && !usuario) router.replace("/login");
  }, [carregado, usuario, router]);

  if (!carregado || !usuario) return <Loading texto="Verificando sessão..." />;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </>
  );
}
