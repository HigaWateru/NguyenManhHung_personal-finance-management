import { FormEvent, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Banknote, PiggyBank, Wallet, X } from "lucide-react";
import { Link } from "react-router-dom";
import { dashboardMetrics } from "../../utils/mockData";
import MetricCard from "../../components/dashboard/MetricCard";
import ChartCard from "../../components/dashboard/ChartCard";
import CategoryCard from "../../components/dashboard/CategoryCard";
import TransactionList from "../../components/dashboard/TransactionList";

type QuickActionType = "income" | "expense";

type QuickActionForm = {
  date: string;
  target: string;
  category: string;
  amount: string;
  note: string;
};

const icons = {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  Banknote,
};

export default function DashboardPage() {
  const [quickActionType, setQuickActionType] = useState<QuickActionType | null>(null);
  const [form, setForm] = useState<QuickActionForm>({
    date: new Date().toISOString().slice(0, 10),
    target: "",
    category: "",
    amount: "",
    note: "",
  });

  const moduleCards = [
    { name: "Thu nhập", route: "/income", desc: "Thêm, tìm kiếm và quản lý tất cả giao dịch thu vào." },
    { name: "Chi tiêu", route: "/expense", desc: "Theo dõi hành vi chi và dòng tiền ra theo danh mục." },
    { name: "Danh mục", route: "/category", desc: "Quản lý nhóm phân loại cho giao dịch thu và chi." },
    { name: "Thống kê", route: "/statistics", desc: "Phân tích tài chính theo tháng, năm và danh mục." },
  ];

  const openQuickAction = (type: QuickActionType) => {
    setQuickActionType(type);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      target: "",
      category: "",
      amount: "",
      note: "",
    });
  };

  const closeQuickAction = () => {
    setQuickActionType(null);
  };

  const handleQuickActionSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.target.trim() || !form.category.trim() || Number(form.amount) <= 0) {
      window.alert("Vui lòng nhập đầy đủ thông tin hợp lệ.");
      return;
    }

    const actionLabel = quickActionType === "income" ? "thu nhập" : "chi tiêu";
    window.alert(`Đã tạo nhanh giao dịch ${actionLabel} (mock).`);
    closeQuickAction();
  };

  const isIncome = quickActionType === "income";
  const modalTitle = isIncome ? "Thêm thu nhập" : "Thêm chi tiêu";
  const targetLabel = isIncome ? "Nguồn thu" : "Đơn vị";
  const targetPlaceholder = isIncome ? "Ví dụ: Lương công ty" : "Ví dụ: WinMart";
  const amountPlaceholder = isIncome ? "Ví dụ: 2500000" : "Ví dụ: 350000";

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr] xl:items-stretch">
          <div className="flex flex-col justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/70">Tổng quan</p>
              <h3 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                Trung tâm điều phối dòng tiền tài chính cá nhân.
              </h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Dashboard theo project scope: tổng số dư, tổng thu, tổng chi, tiết kiệm, giao dịch gần đây và biểu đồ thống kê trên một màn hình duy nhất.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => openQuickAction("income")}
                  className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-5 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/25"
                >
                  + Thêm thu nhập
                </button>
                <button
                  type="button"
                  onClick={() => openQuickAction("expense")}
                  className="inline-flex items-center justify-center rounded-2xl border border-rose-300/40 bg-rose-400/10 px-5 py-2.5 text-sm font-medium text-rose-100 transition hover:bg-rose-400/20"
                >
                  + Thêm chi tiêu
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Ngân sách hoạt động", "12"],
                ["Ví đang theo dõi", "05"],
                ["Mục tiêu đã đạt", "08"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-center backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-cyan-400/20 bg-slate-950/50 p-5">
            <p className="text-sm text-slate-400">Tóm tắt phiên làm việc</p>
            <h4 className="mt-2 text-xl font-semibold text-white">Nhanh hôm nay</h4>

            <div className="mt-5 space-y-4">
              {[
                { label: "Tiền vào hôm nay", value: "$2,180" },
                { label: "Hóa đơn chờ thanh toán", value: "$430" },
                { label: "Số tiền tiết kiệm khả dụng", value: "$9,240" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="font-medium text-white">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {moduleCards.map((item) => (
          <Link key={item.route} to={item.route} className="glass-panel rounded-3xl p-5 transition hover:-translate-y-1">
            <p className="text-sm text-cyan-200">{item.name}</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">{item.desc}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Mở module</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => {
          const Icon = icons[metric.icon as keyof typeof icons];

          return <MetricCard key={metric.label} {...metric} icon={Icon} />;
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <ChartCard />
        <CategoryCard />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <TransactionList />

        <article className="glass-panel rounded-3xl p-5">
          <div>
            <p className="text-sm text-slate-400">Sức khỏe ngân sách</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Tổng kết theo tháng</h3>
          </div>

          <div className="mt-6 space-y-4">
            {[
              { label: "Mục tiêu thu nhập", value: "84%" },
              { label: "Giới hạn chi tiêu", value: "63%" },
              { label: "Mục tiêu tiết kiệm", value: "51%" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="text-cyan-200">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-white/5">
                  <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-sky-300" style={{ width: item.value }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4">
            <p className="text-sm text-cyan-100">Khu vực này đang ở chế độ mock để trình diễn bố cục, cấp bậc thông tin và hành vi responsive trước khi kết nối API thật.</p>
          </div>
        </article>
      </section>

      {quickActionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="glass-panel-strong w-full max-w-xl rounded-3xl p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">Quick Action</p>
                <h4 className="mt-2 text-xl font-semibold text-white">{modalTitle}</h4>
              </div>

              <button
                type="button"
                onClick={closeQuickAction}
                className="rounded-xl border border-white/15 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10"
                aria-label="Đóng"
              >
                <X size={16} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleQuickActionSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="quick-date" className="mb-2 block text-sm text-slate-300">
                    Ngày
                  </label>
                  <input
                    id="quick-date"
                    type="date"
                    value={form.date}
                    onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  />
                </div>

                <div>
                  <label htmlFor="quick-amount" className="mb-2 block text-sm text-slate-300">
                    Số tiền
                  </label>
                  <input
                    id="quick-amount"
                    type="number"
                    min="0"
                    value={form.amount}
                    onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                    placeholder={amountPlaceholder}
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  />
                </div>

                <div>
                  <label htmlFor="quick-target" className="mb-2 block text-sm text-slate-300">
                    {targetLabel}
                  </label>
                  <input
                    id="quick-target"
                    type="text"
                    value={form.target}
                    onChange={(event) => setForm((prev) => ({ ...prev, target: event.target.value }))}
                    placeholder={targetPlaceholder}
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  />
                </div>

                <div>
                  <label htmlFor="quick-category" className="mb-2 block text-sm text-slate-300">
                    Danh mục
                  </label>
                  <input
                    id="quick-category"
                    type="text"
                    value={form.category}
                    onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                    placeholder={isIncome ? "Ví dụ: Freelance" : "Ví dụ: Ăn uống"}
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="quick-note" className="mb-2 block text-sm text-slate-300">
                  Ghi chú
                </label>
                <textarea
                  id="quick-note"
                  rows={3}
                  value={form.note}
                  onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                  placeholder="Mô tả ngắn cho giao dịch"
                  className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeQuickAction}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/25"
                >
                  Lưu nhanh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}