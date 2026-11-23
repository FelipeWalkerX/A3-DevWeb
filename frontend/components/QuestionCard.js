export default function QuestionCard({ questao, totalRespostas }) {
  return (
    <article className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="rounded bg-emerald-50 px-2 py-0.5 font-medium text-emerald-800">
          {questao.disciplina}
        </span>
        <span>{questao.turma}</span>
      </div>
      <p className="text-sm text-slate-800">{questao.enunciado}</p>
      <ul className="list-disc pl-5 text-xs text-slate-500">
        {questao.criterios.map((criterio) => (
          <li key={criterio}>{criterio}</li>
        ))}
      </ul>
      <div className="mt-auto flex justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
        <span>Nota máxima: {questao.notaMaxima}</span>
        <span>{totalRespostas} resposta(s)</span>
      </div>
    </article>
  );
}
