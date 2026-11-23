const variantes = {
  primario: "bg-emerald-700 text-white hover:bg-emerald-800",
  secundario: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
};

export default function Button({ variante = "primario", carregando, children, className = "", ...props }) {
  return (
    <button
      {...props}
      disabled={carregando || props.disabled}
      className={`rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variantes[variante]} ${className}`}
    >
      {children}
    </button>
  );
}
