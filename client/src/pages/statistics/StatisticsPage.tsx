const monthlyBars = [58, 72, 64, 89, 77, 94, 81, 99, 88, 76, 68, 91];

const categorySplit = [
  { label: "Ăn uống", value: 34 },
  { label: "Di chuyển", value: 18 },
  { label: "Tiện ích", value: 22 },
  { label: "Mua sắm", value: 14 },
  { label: "Sức khỏe", value: 12 },
];

export default function StatisticsPage() {
  return (
    <section className="space-y-6">
      <header className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Thống kê</p>
        <h3 className="mt-3 text-3xl font-semibold text-white">Báo cáo tài chính</h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Module thống kê theo kiến trúc MVP: theo tháng, theo năm, theo danh mục với KPI card và biểu đồ hỗ trợ ra quyết định.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <label className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
            Nam
            <select className="mt-1 w-full bg-transparent text-white outline-none">
              <option value="2026" className="bg-slate-900">2026</option>
              <option value="2025" className="bg-slate-900">2025</option>
            </select>
          </label>

          <label className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
            Từ ngày
            <input type="date" className="mt-1 w-full bg-transparent text-white outline-none" />
          </label>

          <label className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
            Đến ngày
            <input type="date" className="mt-1 w-full bg-transparent text-white outline-none" />
          </label>

          <label className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
            Từ khóa
            <input type="text" placeholder="VD: ăn uống" className="mt-1 w-full bg-transparent text-white placeholder:text-slate-500 outline-none" />
          </label>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Thu nhập tháng", "$8,540"],
          ["Chi tiêu tháng", "$4,260"],
          ["Số dư ròng", "$4,280"],
          ["Tỷ lệ tiết kiệm", "50.1%"],
        ].map(([label, value]) => (
          <article key={label} className="glass-panel rounded-3xl p-5">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <article className="glass-panel rounded-3xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">Xu hướng theo tháng</h4>
            <span className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">2026</span>
          </div>
          <div className="flex h-56 items-end gap-2">
            {monthlyBars.map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-44 w-full items-end rounded-2xl bg-slate-950/40 p-1">
                  <div className="w-full rounded-xl bg-gradient-to-t from-cyan-500 to-blue-500" style={{ height: `${value}%` }} />
                </div>
                <span className="text-[10px] text-slate-500">{index + 1}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel rounded-3xl p-5">
          <h4 className="text-lg font-semibold text-white">Tỷ trọng theo danh mục</h4>
          <div className="mt-4 space-y-3">
            {categorySplit.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="text-cyan-100">{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </section>
  );
}
