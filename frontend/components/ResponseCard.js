import Button from "./Button";
import StatusBadge from "./StatusBadge";

export default function ResponseCard({ resposta, questao, onAlterarStatus, salvando }) {
  const revisada = resposta.status === "revisada";

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-medium text-slate-800">{resposta.aluno}</h3>
          <p className="text-xs text-slate-500">
            {resposta.turma} · {questao ? questao.disciplina : "Questão removida"}
          </p>
        </div>
        <StatusBadge status={resposta.status} />
      </div>

      {questao && <p className="text-xs text-slate-500">{questao.enunciado}</p>}
      <p className="rounded bg-slate-50 p-3 text-sm italic text-slate-700">“{resposta.resposta}”</p>

      <div className="rounded border border-emerald-100 bg-emerald-50/60 p-3 text-sm">
        <p className="font-medium text-emerald-900">
          Nota sugerida: {resposta.notaSugerida}
          {questao && <span className="font-normal text-emerald-700"> / {questao.notaMaxima}</span>}
        </p>
        <p className="mt-1 text-emerald-900/80">{resposta.comentarioIA}</p>
      </div>

      <Button
        variante="secundario"
        carregando={salvando}
        onClick={() => onAlterarStatus(resposta, revisada ? "pendente" : "revisada")}
        className="self-end"
      >
        {salvando ? "Salvando..." : revisada ? "Voltar para pendente" : "Marcar como revisada"}
      </Button>
    </article>
  );
}
