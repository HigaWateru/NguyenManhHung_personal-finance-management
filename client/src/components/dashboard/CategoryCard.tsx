type CategorySplit = {
  label: string;
  value: number;
};

type CategoryCardProps = {
  categories?: CategorySplit[];
  spentPercent?: number;
};

export default function CategoryCard({ categories, spentPercent }: CategoryCardProps) {
  const categoryData = categories ?? [];
  const total = categoryData.reduce((sum, item) => sum + item.value, 0);

  let start = 0;
  const segments = categoryData.map((item, index) => {
    const percent = total > 0 ? (item.value / total) * 100 : 0;
    const end = start + percent;
    const colors = ["#06b6d4", "#10b981", "#6366f1", "#f59e0b", "#3b82f6", "#f43f5e"];
    const color = colors[index % colors.length];

    const segment = `${color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
    start = end;

    return segment;
  });

  const donutBackground = segments.length > 0 ? `conic-gradient(${segments.join(", ")})` : "conic-gradient(#1e293b 0% 100%)";

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
            <p className="mt-2 text-2xl font-semibold text-white">{Math.max(0, Math.min(999, spentPercent ?? 68)).toFixed(1)}%</p>
          </div>
        </div>

        {categoryData.length === 0 ? (
          <p className="text-center text-sm text-slate-400">Chưa có dữ liệu chi tiêu trong tháng để phân bổ theo danh mục.</p>
        ) : (
          <div className="space-y-3">
            {categoryData.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="text-slate-400">{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5">
                  <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}