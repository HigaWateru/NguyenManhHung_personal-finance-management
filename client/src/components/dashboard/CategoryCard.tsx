import { useLanguage } from "../../context/LanguageContext"

type CategorySplit = {
  label: string
  value: number
}

type CategoryCardProps = {
  categories?: CategorySplit[]
  spentPercent?: number
}

export default function CategoryCard({ categories, spentPercent }: CategoryCardProps) {
  const { t } = useLanguage()
  const categoryData = categories ?? []
  const topCategory = categoryData.length > 0 ? categoryData[0] : null
  const total = categoryData.reduce((sum, item) => sum + item.value, 0)
  
  const colors = [
    "#22d3ee", // Cyan
    "#f43f5e", // Rose
    "#3b82f6", // Blue
    "#10b981", // Emerald
    "#8b5cf6", // Purple
    "#f59e0b", // Amber
    "#ec4899", // Pink
    "#14b8a6", // Teal
    "#6366f1", // Indigo
    "#f97316"  // Orange
  ]

  const segments = categoryData.reduce<{ offset: number; values: string[] }>((acc, item, index) => {
    const percent = total > 0 ? (item.value / total) * 100 : 0
    const start = acc.offset
    const end = start + percent
    const color = colors[index % colors.length]

    acc.values.push(`${color} ${start.toFixed(2)}% ${end.toFixed(2)}%`)
    acc.offset = end

    return acc
  }, { offset: 0, values: [] }).values

  const donutBackground = segments.length > 0 ? `conic-gradient(${segments.join(", ")})` : "conic-gradient(#1e293b 0% 100%)"

  return (
    <article className="glass-panel rounded-3xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm text-slate-400">{t("nav_categories")}</p>
          <h3 className="mt-1 text-xl font-semibold text-white">{t("dash_cat_distribution")}</h3>
        </div>
        {topCategory && (
          <div className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
            {t("dash_top_category_prefix")}: <span className="font-semibold text-white">{topCategory.label}</span> ({topCategory.value}%)
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-4">
        <div className="relative mx-auto grid h-44 w-44 place-items-center rounded-full border border-white/10 bg-slate-950/60 p-2">
          <div className="h-full w-full rounded-full" style={{ background: donutBackground }} />
          <div className="absolute grid h-28 w-28 place-items-center rounded-full border border-cyan-400/30 bg-slate-900/90 text-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-200/70">SPENT</p>
              <p className="mt-1 text-2xl font-bold text-white">{Math.max(0, Math.min(999, spentPercent ?? 0)).toFixed(1)}%</p>
              {topCategory && (
                <p className="mt-0.5 truncate text-[10px] text-slate-400 max-w-[90px] mx-auto" title={`${topCategory.label}: ${topCategory.value}%`}>
                  {topCategory.label}: <span className="font-semibold text-cyan-300">{topCategory.value}%</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {categoryData.length === 0 ? (
          <p className="text-center text-sm text-slate-400">{t("no_data")}</p>
        ) : (
          <div className="space-y-3 mt-2">
            {categoryData.map((item, index) => {
              const itemColor = colors[index % colors.length]
              const isTop = index === 0

              return (
                <div key={item.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-200">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: itemColor }} />
                      <span className={isTop ? "font-semibold text-white" : ""}>{item.label}</span>
                      {isTop && <span className="rounded bg-cyan-400/15 px-1.5 py-0.5 text-[10px] font-medium text-cyan-300">Top 1</span>}
                    </span>
                    <span className="font-semibold text-slate-300">{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5">
                    <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${item.value}%`, backgroundColor: itemColor }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </article>
  )
}