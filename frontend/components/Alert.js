const estilos = {
  erro: "border-red-200 bg-red-50 text-red-700",
  sucesso: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
};

export default function Alert({ tipo = "info", children, acao }) {
  return (
    <div
      role={tipo === "erro" ? "alert" : "status"}
      className={`flex items-center justify-between gap-3 rounded-md border px-4 py-3 text-sm ${estilos[tipo]}`}
    >
      <span>{children}</span>
      {acao}
    </div>
  );
}
