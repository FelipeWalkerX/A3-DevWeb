export default function StatusBadge({ status }) {
  const revisada = status === "revisada";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        revisada ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      {revisada ? "Revisada" : "Pendente"}
    </span>
  );
}
