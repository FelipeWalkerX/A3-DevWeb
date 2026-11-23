// Label + campo + mensagem de erro, usado em todos os formulários
export default function Field({ label, erro, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label}
      {children}
      {erro && <span className="text-xs font-normal text-red-600">{erro}</span>}
    </label>
  );
}

export function inputClass(erro) {
  return `rounded-md border px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200 ${
    erro ? "border-red-400" : "border-slate-300 focus:border-emerald-500"
  }`;
}
