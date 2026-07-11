export default function ChartCard() {
  const cashFlowByDay = [
    { day: "T2", income: 72, expense: 44 },
    { day: "T3", income: 88, expense: 55 },
    { day: "T4", income: 64, expense: 49 },
    { day: "T5", income: 92, expense: 58 },
    { day: "T6", income: 77, expense: 61 },
    { day: "T7", income: 96, expense: 67 },
    { day: "CN", income: 84, expense: 52 },
  ];

  return (
    <article className="glass-panel rounded-3xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Dòng tiền</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Xu hướng theo tuần</h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 text-emerald-300">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" /> Thu vào
          </span>
          <span className="inline-flex items-center gap-1 text-rose-300">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-400" /> Chi ra
          </span>
        </div>
      </div>

      <div className="mt-8 flex h-56 items-end gap-3">
        {cashFlowByDay.map((item) => (
          <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-44 w-full items-end justify-center gap-1 rounded-xl bg-slate-950/40 p-2">
              <div
                className="w-1/2 rounded-sm bg-gradient-to-t from-emerald-500 to-emerald-300"
                style={{ height: `${item.income}%` }}
                title={`Thu vào: ${item.income}`}
              />
              <div
                className="w-1/2 rounded-sm bg-gradient-to-t from-rose-500 to-rose-300"
                style={{ height: `${item.expense}%` }}
                title={`Chi ra: ${item.expense}`}
              />
            </div>

            <div className="text-center">
              <p className="text-[10px] text-slate-400">{item.day}</p>
              <p className={`text-[10px] ${item.income - item.expense >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                {item.income - item.expense >= 0 ? "+" : ""}{item.income - item.expense}
              </p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}