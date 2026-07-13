import { Plus, Search } from "lucide-react"

type CrudColumn = {
  key: string
  label: string
  align?: "left" | "right"
}

type CrudRow = Record<string, string>

type CrudModulePageProps = {
  kicker: string
  title: string
  description: string
  entities: string[]
  columns: CrudColumn[]
  rows: CrudRow[]
  actionLabel: string
  filterPlaceholder: string
}

export default function CrudModulePage({kicker, title, description, entities, columns, rows, actionLabel,
  filterPlaceholder}: CrudModulePageProps) {
  return (
    <section className="space-y-6">
      <header className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">{kicker}</p>
        <h3 className="mt-3 text-3xl font-semibold text-white">{title}</h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {entities.map((entity) => (
            <span key={entity} className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
              {entity}
            </span>
          ))}
        </div>
      </header>

      <article className="glass-panel rounded-3xl p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-slate-300 md:w-[420px]">
            <Search size={16} className="text-cyan-300/80" />
            <input type="text" placeholder={filterPlaceholder}
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
            />
          </label>

          <button type="button"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/25"
          >
            <Plus size={16} /> {actionLabel}
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className={`px-4 py-3 ${column.align === "right" ? "text-right" : "text-left"}`}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10 bg-slate-950/40 text-slate-200">
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-white/5">
                  {columns.map((column) => (
                    <td key={`${index}-${column.key}`} className={`px-4 py-3 ${column.align === "right" ? "text-right" : "text-left"}`}>
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
          <p>Hiển thị 1-5 trong tổng số 42 bản ghi</p>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300">
              Trước
            </button>
            <button type="button" className="rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-3 py-1.5 text-cyan-100">
              1
            </button>
            <button type="button" className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300">
              2
            </button>
            <button type="button" className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300">
              Sau
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}
