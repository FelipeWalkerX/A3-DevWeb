"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";

// Página inicial: manda para o login ou para o dashboard
export default function Home() {
  const router = useRouter();
  const { usuario, carregado } = useAuth();

  useEffect(() => {
    if (carregado) router.replace(usuario ? "/dashboard" : "/login");
  }, [carregado, usuario, router]);

  return <Loading />;
}
