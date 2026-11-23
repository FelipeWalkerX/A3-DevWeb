"use client";

import { useState } from "react";
import Link from "next/link";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Field, { inputClass } from "@/components/Field";
import { criarQuestao } from "@/services/questoes";

const formVazio = {
  disciplina: "",
  turma: "",
  enunciado: "",
  respostaEsperada: "",
  criterios: "",
  notaMaxima: "",
};

function validar(form) {
  const erros = {};
  if (!form.disciplina.trim()) erros.disciplina = "Informe a disciplina.";
  if (!form.turma.trim()) erros.turma = "Informe a turma.";
  if (!form.enunciado.trim()) erros.enunciado = "Escreva o enunciado.";
  if (!form.respostaEsperada.trim()) erros.respostaEsperada = "Escreva a resposta esperada.";
  if (!form.criterios.trim()) erros.criterios = "Informe ao menos um critério.";
  const nota = Number(form.notaMaxima);
  if (!form.notaMaxima || nota <= 0 || nota > 10) erros.notaMaxima = "A nota deve ser maior que 0 e no máximo 10.";
  return erros;
}

export default function NovaQuestaoPage() {
  const [form, setForm] = useState(formVazio);
  const [erros, setErros] = useState({});
  const [erroApi, setErroApi] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [salvando, setSalvando] = useState(false);

  function alterar(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setErros({ ...erros, [event.target.name]: "" });
    setSucesso("");
  }

  async function salvar(event) {
    event.preventDefault();
    const novosErros = validar(form);
    setErros(novosErros);
    if (Object.keys(novosErros).length) return;

    setSalvando(true);
    setErroApi("");
    try {
      await criarQuestao({
        disciplina: form.disciplina.trim(),
        turma: form.turma.trim(),
        enunciado: form.enunciado.trim(),
        respostaEsperada: form.respostaEsperada.trim(),
        // Um critério por linha
        criterios: form.criterios.split("\n").map((c) => c.trim()).filter(Boolean),
        notaMaxima: Number(form.notaMaxima),
      });
      setSucesso("Questão cadastrada! Ela já aparece no dashboard e na correção com IA.");
      setForm(formVazio);
    } catch (error) {
      setErroApi(error.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Nova questão</h1>
        <p className="text-sm text-slate-500">
          A resposta esperada e os critérios são usados pela IA na hora de sugerir a nota.
        </p>
      </div>

      {sucesso && (
        <Alert tipo="sucesso" acao={<Link href="/dashboard" className="font-medium underline">Ver no dashboard</Link>}>
          {sucesso}
        </Alert>
      )}
      {erroApi && <Alert tipo="erro">{erroApi}</Alert>}

      <form onSubmit={salvar} noValidate className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Disciplina" erro={erros.disciplina}>
            <input name="disciplina" value={form.disciplina} onChange={alterar} className={inputClass(erros.disciplina)} />
          </Field>
          <Field label="Turma" erro={erros.turma}>
            <input name="turma" value={form.turma} onChange={alterar} placeholder="Ex: 8º ano A" className={inputClass(erros.turma)} />
          </Field>
        </div>
        <Field label="Enunciado" erro={erros.enunciado}>
          <textarea name="enunciado" rows={3} value={form.enunciado} onChange={alterar} className={inputClass(erros.enunciado)} />
        </Field>
        <Field label="Resposta esperada" erro={erros.respostaEsperada}>
          <textarea
            name="respostaEsperada"
            rows={3}
            value={form.respostaEsperada}
            onChange={alterar}
            className={inputClass(erros.respostaEsperada)}
          />
        </Field>
        <Field label="Critérios de correção (um por linha)" erro={erros.criterios}>
          <textarea name="criterios" rows={4} value={form.criterios} onChange={alterar} className={inputClass(erros.criterios)} />
        </Field>
        <Field label="Nota máxima" erro={erros.notaMaxima}>
          <input
            name="notaMaxima"
            type="number"
            min="0.5"
            max="10"
            step="0.5"
            value={form.notaMaxima}
            onChange={alterar}
            className={`${inputClass(erros.notaMaxima)} sm:w-40`}
          />
        </Field>
        <Button type="submit" carregando={salvando} className="self-end">
          {salvando ? "Salvando..." : "Salvar questão"}
        </Button>
      </form>
    </div>
  );
}
