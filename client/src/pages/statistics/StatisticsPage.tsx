import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const monthlyFinance = [
  { month: "T1", income: 18.5, expense: 11.2, net: 7.3 },
  { month: "T2", income: 19.8, expense: 12.4, net: 7.4 },
  { month: "T3", income: 21.2, expense: 13.6, net: 7.6 },
  { month: "T4", income: 20.5, expense: 12.1, net: 8.4 },
  { month: "T5", income: 22.9, expense: 14.2, net: 8.7 },
  { month: "T6", income: 24.6, expense: 15.1, net: 9.5 },
  { month: "T7", income: 26.1, expense: 16.8, net: 9.3 },
  { month: "T8", income: 25.4, expense: 16.2, net: 9.2 },
  { month: "T9", income: 23.7, expense: 15.3, net: 8.4 },
  { month: "T10", income: 24.2, expense: 14.7, net: 9.5 },
  { month: "T11", income: 22.8, expense: 13.9, net: 8.9 },
  { month: "T12", income: 27.3, expense: 17.4, net: 9.9 },
];

const expenseByCategory = [
  { name: "Ăn uống", value: 34, amount: 5.9 },
  { name: "Di chuyển", value: 18, amount: 3.1 },
  { name: "Tiện ích", value: 22, amount: 3.8 },
  { name: "Mua sắm", value: 14, amount: 2.4 },
  { name: "Sức khỏe", value: 12, amount: 2.1 },
];

const pieColors = ["#22d3ee", "#38bdf8", "#3b82f6", "#0ea5e9", "#14b8a6"];

const formatMoney = (value: number) => `${value.toFixed(1)}M`;

export default function StatisticsPage() {
  const yearlyIncome = monthlyFinance.reduce((sum, item) => sum + item.income, 0);
  const yearlyExpense = monthlyFinance.reduce((sum, item) => sum + item.expense, 0);
  const yearlyNet = yearlyIncome - yearlyExpense;
  const savingRate = yearlyIncome > 0 ? (yearlyNet / yearlyIncome) * 100 : 0;

  return (
    <section className="space-y-6">
      <header className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Thống kê</p>
        <h3 className="mt-3 text-3xl font-semibold text-white">Báo cáo tài chính</h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Module thống kê trực quan bằng Recharts, hiển thị tương quan Thu nhập và Chi tiêu theo thời gian cùng phân bố chi tiêu theo danh mục.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <label className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
            Năm
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
          ["Tổng thu năm", formatMoney(yearlyIncome)],
          ["Tổng chi năm", formatMoney(yearlyExpense)],
          ["Số dư ròng", formatMoney(yearlyNet)],
          ["Tỷ lệ tiết kiệm", `${savingRate.toFixed(1)}%`],
        ].map(([label, value]) => (
          <article key={label} className="glass-panel rounded-3xl p-5">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <article className="glass-panel rounded-3xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">Bar Chart: Thu và chi theo tháng</h4>
            <span className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">2026</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFinance}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={formatMoney} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.92)",
                    border: "1px solid rgba(34, 211, 238, 0.2)",
                    borderRadius: "14px",
                    color: "#e2e8f0",
                  }}
                  formatter={(value: number) => `${formatMoney(value)}`}
                />
                <Legend />
                <Bar dataKey="income" name="Thu nhập" fill="#22d3ee" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" name="Chi tiêu" fill="#fb7185" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="glass-panel rounded-3xl p-5">
          <h4 className="text-lg font-semibold text-white">Pie Chart: Tỷ trọng chi tiêu</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={96}
                  paddingAngle={2}
                  stroke="rgba(15, 23, 42, 0.8)"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.92)",
                    border: "1px solid rgba(34, 211, 238, 0.2)",
                    borderRadius: "14px",
                    color: "#e2e8f0",
                  }}
                  formatter={(value: number, _name, props) => [`${value}% | ${formatMoney(props.payload.amount)}`, "Tỷ trọng"]}
                />
                <Legend verticalAlign="bottom" height={24} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section>
        <article className="glass-panel rounded-3xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">Line Chart: Xu hướng số dư ròng</h4>
            <span className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">Theo tháng</span>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyFinance}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={formatMoney} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.92)",
                    border: "1px solid rgba(34, 211, 238, 0.2)",
                    borderRadius: "14px",
                    color: "#e2e8f0",
                  }}
                  formatter={(value: number) => `${formatMoney(value)}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="net"
                  name="Số dư ròng"
                  stroke="#22d3ee"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#22d3ee" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Thu nhập"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  name="Chi tiêu"
                  stroke="#fb7185"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {expenseByCategory.map((item, index) => (
          <article key={item.name} className="glass-panel rounded-2xl p-4">
            <div className="mb-3 h-1.5 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
            <p className="text-sm text-slate-300">{item.name}</p>
            <p className="mt-2 text-xl font-semibold text-white">{item.value}%</p>
            <p className="mt-1 text-xs text-slate-400">{formatMoney(item.amount)} / năm</p>
          </article>
        ))}
      </section>
    </section>
  );
}
