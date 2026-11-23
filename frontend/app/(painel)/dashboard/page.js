"use client";

import { useState } from "react";
import Link from "next/link";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import QuestionCard from "@/components/QuestionCard";
import ResponseCard from "@/components/ResponseCard";
import StatCard from "@/components/StatCard";
import { useAuth } from "@/context/AuthContext";
import { useApiData } from "@/hooks/useApiData";
import { listarQuestoes } from "@/services/questoes";
import { alterarStatus, listarRespostas } from "@/services/respostas";

const filtros = [
  { valor: "todas", label: "Todas" },
  { valor: "pendente", label: "Pendentes" },
  { valor: "revisada", label: "Revisadas" },
];

export default function DashboardPage() {
  const { usuario } = useAuth();
  const questoes = useApiData(listarQuestoes);
  const respostas = useApiData(listarRespostas);
  const [filtro, setFiltro] = useState("todas");
  const [salvandoId, setSalvandoId] = useState(null);
  const [erroStatus, setErroStatus] = useState("");

  async function trocarStatus(resposta, novoStatus) {
    setSalvandoId(resposta.id);
    setErroStatus("");
    try {
      const atualizada = await alterarStatus(resposta.id, novoStatus);
      respostas.setDados(respostas.dados.map((item) => (item.id === atualizada.id ? atualizada : item)));
    } catch (error) {
      setErroStatus(error.message);
    } finally {
      setSalvandoId(null);
    }
  }

  const listaQuestoes = questoes.dados ?? [];
  const listaRespostas = respostas.dados ?? [];
  const questaoPorId = Object.fromEntries(listaQuestoes.map((q) => [q.id, q]));
  const pendentes = listaRespostas.filter((r) => r.status === "pendente").length;
  const respostasFiltradas =
    filtro === "todas" ? listaRespostas : listaRespostas.filter((r) => r.status === filtro);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-2xl font-semibold text-slate-800">Olá, {usuario.nome}</h1>
        <p className="text-sm text-slate-500">Acompanhe suas questões e as correções sugeridas pela IA.</p>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard titulo="Questões" valor={questoes.carregando ? "..." : listaQuestoes.length} />
        <StatCard titulo="Respostas" valor={respostas.carregando ? "..." : listaRespostas.length} />
        <StatCard
          titulo="Pendentes de revisão"
          valor={respostas.carregando ? "..." : pendentes}
          detalhe="Notas sugeridas que você ainda não conferiu"
        />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Questões</h2>
          <Link href="/questoes/nova" className="text-sm font-medium text-emerald-700 hover:underline">
            + Nova questão
          </Link>
        </div>
        {questoes.carregando && <Loading texto="Carregando questões..." />}
        {questoes.erro && (
          <Alert tipo="erro" acao={<Button variante="secundario" onClick={questoes.recarregar}>Tentar novamente</Button>}>
            {questoes.erro}
          </Alert>
        )}
        {!questoes.carregando && !questoes.erro && listaQuestoes.length === 0 && (
          <p className="text-sm text-slate-500">Nenhuma questão cadastrada.</p>
        )}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {listaQuestoes.map((questao) => (
            <QuestionCard
              key={questao.id}
              questao={questao}
              totalRespostas={listaRespostas.filter((r) => r.questionId === questao.id).length}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-800">Respostas dos alunos</h2>
          <div className="flex gap-1 text-sm">
            {filtros.map((item) => (
              <button
                key={item.valor}
                onClick={() => setFiltro(item.valor)}
                className={`rounded-md px-3 py-1 ${
                  filtro === item.valor ? "bg-emerald-700 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        {erroStatus && <Alert tipo="erro">{erroStatus}</Alert>}
        {respostas.carregando && <Loading texto="Carregando respostas..." />}
        {respostas.erro && (
          <Alert tipo="erro" acao={<Button variante="secundario" onClick={respostas.recarregar}>Tentar novamente</Button>}>
            {respostas.erro}
          </Alert>
        )}
        {!respostas.carregando && !respostas.erro && respostasFiltradas.length === 0 && (
          <p className="text-sm text-slate-500">Nenhuma resposta encontrada.</p>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          {respostasFiltradas.map((resposta) => (
            <ResponseCard
              key={resposta.id}
              resposta={resposta}
              questao={questaoPorId[resposta.questionId]}
              salvando={salvandoId === resposta.id}
              onAlterarStatus={trocarStatus}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
