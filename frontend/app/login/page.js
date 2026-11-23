"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Field, { inputClass } from "@/components/Field";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { usuario, carregado, entrar } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [erros, setErros] = useState({});
  const [erroApi, setErroApi] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Se já estiver logado, vai direto para o dashboard
  useEffect(() => {
    if (carregado && usuario) router.replace("/dashboard");
  }, [carregado, usuario, router]);

  function alterar(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setErros({ ...erros, [event.target.name]: "" });
  }

  async function enviar(event) {
    event.preventDefault();
    const novosErros = {};
    if (!form.username.trim()) novosErros.username = "Informe o usuário.";
    if (!form.password) novosErros.password = "Informe a senha.";
    setErros(novosErros);
    if (Object.keys(novosErros).length) return;

    setEnviando(true);
    setErroApi("");
    try {
      await entrar(form.username.trim(), form.password);
      router.replace("/dashboard");
    } catch (error) {
      setErroApi(error.message);
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={enviar}
        noValidate
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <h1 className="text-2xl font-semibold text-emerald-800">Clareia</h1>
          <p className="text-sm text-slate-500">Entre com sua conta de professor.</p>
        </div>

        {erroApi && <Alert tipo="erro">{erroApi}</Alert>}

        <Field label="Usuário" erro={erros.username}>
          <input
            name="username"
            autoComplete="username"
            value={form.username}
            onChange={alterar}
            className={inputClass(erros.username)}
          />
        </Field>
        <Field label="Senha" erro={erros.password}>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={alterar}
            className={inputClass(erros.password)}
          />
        </Field>

        <Button type="submit" carregando={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </main>
  );
}
