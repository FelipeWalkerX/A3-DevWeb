"use client";

import { useCallback, useEffect, useState } from "react";

// Faz um GET na API e controla os estados de carregando e erro
export function useApiData(buscar) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      setDados(await buscar());
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }, [buscar]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { dados, setDados, carregando, erro, recarregar };
}
