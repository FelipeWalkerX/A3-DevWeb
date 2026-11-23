"use client";

import { useState } from "react";
import Link from "next/link";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Field, { inputClass } from "@/components/Field";
import Loading from "@/components/Loading";
import { useApiData } from "@/hooks/useApiData";
import { listarQuestoes } from "@/services/questoes";
import { enviarResposta } from "@/services/respostas";

const formVazio = { questionId: "", aluno: "", turma: "", resposta: "" };

export default function CorrecaoPage() {
  const questoes = useApiData(listarQuestoes);
  const [form, setForm] = useState(formVazio);
  const [erros, setErros] = useState({});
  const [erroApi, setErroApi] = useState("");
  const [corrigindo, setCorrigindo] = useState(false);
  const [resultado, setResultado] = useState(null);

  const questaoSelecionada = questoes.dados?.find((q) => q.id === form.questionId);

  function alterar(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setErros({ ...erros, [event.target.name]: "" });
  }

  async function corrigir(event) {
    event.preventDefault();
    const novosErros = {};
    if (!form.questionId) novosErros.questionId = "Escolha a questão.";
    if (!form.aluno.trim()) novosErros.aluno = "Informe o nome do aluno.";
    if (!form.resposta.trim()) novosErros.resposta = "Cole a resposta do aluno.";
    setErros(novosErros);
    if (Object.keys(novosErros).length) return;

    setCorrigindo(true);
    setErroApi("");
    try {
      const salva = await enviarResposta({
        questionId: form.questionId,
        aluno: form.aluno.trim(),
        turma: form.turma.trim() || null,
        resposta: form.resposta.trim(),
      });
      setResultado({ resposta: salva, questao: questaoSelecionada });
      setForm(formVazio);
    } catch (error) {
      setErroApi(error.message);
    } finally {
      setCorrigindo(false);
    }
  }

  if (questoes.carregando) return <Loading texto="Carregando questões..." />;
  if (questoes.erro) {
    return (
      <Alert tipo="erro" acao={<Button variante="secundario" onClick={questoes.recarregar}>Tentar novamente</Button>}>
        {questoes.erro}
      </Alert>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Correção com IA</h1>
          <p className="text-sm text-slate-500">
            Escolha a questão e cole a resposta do aluno. A IA compara com a resposta esperada e os critérios
            e sugere uma nota, que fica salva como pendente para você revisar.
          </p>
        </div>

        <form onSubmit={corrigir} noValidate className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5">
          {erroApi && <Alert tipo="erro">{erroApi}</Alert>}

          <Field label="Questão" erro={erros.questionId}>
            <select name="questionId" value={form.questionId} onChange={alterar} className={inputClass(erros.questionId)}>
              <option value="">Selecione...</option>
              {questoes.dados.map((questao) => (
                <option key={questao.id} value={questao.id}>
                  {questao.disciplina} ({questao.turma}) - {questao.enunciado.slice(0, 60)}
                </option>
              ))}
            </select>
          </Field>

          {questaoSelecionada && (
            <div className="rounded bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-medium text-slate-700">{questaoSelecionada.enunciado}</p>
              <p className="mt-2">Critérios:</p>
              <ul className="list-disc pl-5">
                {questaoSelecionada.criterios.map((criterio) => (
                  <li key={criterio}>{criterio}</li>
                ))}
              </ul>
              <p className="mt-2">Nota máxima: {questaoSelecionada.notaMaxima}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Aluno" erro={erros.aluno}>
              <input name="aluno" value={form.aluno} onChange={alterar} className={inputClass(erros.aluno)} />
            </Field>
            <Field label="Turma (opcional)">
              <input
                name="turma"
                value={form.turma}
                onChange={alterar}
                placeholder={questaoSelecionada?.turma}
                className={inputClass()}
              />
            </Field>
          </div>

          <Field label="Resposta do aluno" erro={erros.resposta}>
            <textarea
              name="resposta"
              rows={6}
              value={form.resposta}
              onChange={alterar}
              className={inputClass(erros.resposta)}
            />
          </Field>

          <Button type="submit" carregando={corrigindo}>
            {corrigindo ? "Corrigindo com IA..." : "Corrigir resposta"}
          </Button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-slate-800">Resultado</h2>
        {corrigindo && <Loading texto="A IA está analisando a resposta..." />}
        {!corrigindo && !resultado && (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            A nota sugerida aparece aqui depois da correção.
          </p>
        )}
        {!corrigindo && resultado && (
          <div className="flex flex-col gap-3 rounded-lg border border-emerald-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              {resultado.resposta.aluno} · {resultado.questao?.disciplina}
            </p>
            <p className="text-3xl font-semibold text-emerald-800">
              {resultado.resposta.notaSugerida}
              <span className="text-base font-normal text-slate-500"> / {resultado.questao?.notaMaxima}</span>
            </p>
            <p className="text-sm text-slate-700">{resultado.resposta.comentarioIA}</p>
            <Alert tipo="info">A resposta foi salva como pendente. Revise a nota no dashboard.</Alert>
            <Link href="/dashboard" className="text-sm font-medium text-emerald-700 hover:underline">
              Ir para o dashboard
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
