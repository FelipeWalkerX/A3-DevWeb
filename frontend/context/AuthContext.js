"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setSessionExpiredHandler } from "@/services/api";
import * as authService from "@/services/auth";
import { getSession } from "@/services/session";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  // Só depois de ler o localStorage sabemos se tem alguém logado
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    setUsuario(getSession()?.usuario ?? null);
    setCarregado(true);

    setSessionExpiredHandler(() => {
      setUsuario(null);
      router.replace("/login");
    });
  }, [router]);

  async function entrar(username, password) {
    const session = await authService.login(username, password);
    setUsuario(session.usuario);
  }

  function sair() {
    authService.logout();
    setUsuario(null);
    router.replace("/login");
  }

  return (
    <AuthContext.Provider value={{ usuario, carregado, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
