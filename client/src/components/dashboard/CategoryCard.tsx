import { categoryProgress } from "../../utils/mockData";

export default function CategoryCard() {
  const total = categoryProgress.reduce((sum, item) => sum + item.value, 0);

  let start = 0;
  const segments = categoryProgress.map((item) => {
    const percent = total > 0 ? (item.value / total) * 100 : 0;
    const end = start + percent;
    const color = item.color.includes("emerald")
      ? "#10b981"
      : item.color.includes("amber")
        ? "#f59e0b"
        : item.color.includes("indigo")
          ? "#6366f1"
          : "#06b6d4";

    const segment = `${color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
    start = end;

    return segment;
  });

  const donutBackground = `conic-gradient(${segments.join(", ")})`;

  return (
    <article className="glass-panel rounded-3xl p-5">
      <div>
        <p className="text-sm text-slate-400">Danh mục</p>
        <h3 className="mt-2 text-xl font-semibold text-white">Phân bổ chi tiêu</h3>
      </div>

      <div className="mt-6 grid gap-4">
        <div className="relative mx-auto grid h-44 w-44 place-items-center rounded-full border border-white/10 bg-slate-950/60 p-2">
          <div className="h-full w-full rounded-full" style={{ background: donutBackground }} />
          <div className="absolute grid h-28 w-28 place-items-center rounded-full border border-cyan-400/30 bg-slate-900/90">
            <p className="text-center text-xs uppercase tracking-[0.35em] text-cyan-200/70">Đã chi</p>
            <p className="mt-2 text-2xl font-semibold text-white">68%</p>
          </div>
        </div>

        <div className="space-y-3">
          {categoryProgress.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-300">{item.label}</span>
                <span className="text-slate-400">{item.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5">
                <div className={`h-2 rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}