import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ArrowDownRight, ArrowUpRight, Banknote, PiggyBank, Wallet, X } from "lucide-react";
import { Link } from "react-router-dom";
import { dashboardMetrics } from "../../utils/mockData";
import MetricCard from "../../components/dashboard/MetricCard";
import ChartCard from "../../components/dashboard/ChartCard";
import CategoryCard from "../../components/dashboard/CategoryCard";
import TransactionList from "../../components/dashboard/TransactionList";
import { apiService } from "../../apis/service";
import { extractApiError } from "../../apis/http";
import type { CategoryItem, DashboardData, RecentTransaction } from "../../types/api";

type QuickActionType = "income" | "expense";

type QuickActionForm = {
  date: string;
  categoryId: string;
  amount: string;
  note: string;
};

type DashboardTransaction = {
  id: number;
  title: string;
  category: string;
  amount: string;
  time: string;
  type: "income" | "expense";
};

type WeekFlowItem = {
  day: string;
  income: number;
  expense: number;
};

type CategorySplit = {
  label: string;
  value: number;
};

const icons = {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  Banknote,
};

function mapApiTransactions(data: RecentTransaction[]): DashboardTransaction[] {
  return data.map((item) => ({
    id: item.id,
    title: item.note || `${item.type === "INCOME" ? "Thu" : "Chi"} từ ${item.categoryName}`,
    category: item.categoryName,
    amount: `${item.type === "INCOME" ? "+" : "-"}${new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(item.amount)}`,
    time: new Date(item.createdAt).toLocaleString("vi-VN"),
    type: item.type === "INCOME" ? "income" : "expense",
  }));
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [weeklyFlow, setWeeklyFlow] = useState<WeekFlowItem[]>([]);
  const [categorySplit, setCategorySplit] = useState<CategorySplit[]>([]);

  const [quickActionType, setQuickActionType] = useState<QuickActionType | null>(null);
  const [quickActionCategories, setQuickActionCategories] = useState<CategoryItem[]>([]);
  const [quickActionSaving, setQuickActionSaving] = useState(false);
  const [quickActionError, setQuickActionError] = useState<string | null>(null);
  const [form, setForm] = useState<QuickActionForm>({
    date: new Date().toISOString().slice(0, 10),
    categoryId: "",
    amount: "",
    note: "",
  });

  const moduleCards = [
    { name: "Thu nhập", route: "/income", desc: "Thêm, tìm kiếm và quản lý tất cả giao dịch thu vào." },
    { name: "Chi tiêu", route: "/expense", desc: "Theo dõi hành vi chi và dòng tiền ra theo danh mục." },
    { name: "Danh mục", route: "/category", desc: "Quản lý nhóm phân loại cho giao dịch thu và chi." },
    { name: "Thống kê", route: "/statistics", desc: "Phân tích tài chính theo tháng, năm và danh mục." },
  ];

  const openQuickAction = async (type: QuickActionType) => {
    setQuickActionError(null);
    setQuickActionSaving(false);
    setQuickActionType(type);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      categoryId: "",
      amount: "",
      note: "",
    });

    try {
      const categories = await apiService.getCategories(type === "income" ? "INCOME" : "EXPENSE");
      setQuickActionCategories(categories);
    } catch (error) {
      setQuickActionError(extractApiError(error, "Không thể tải danh mục cho tác vụ nhanh."));
      setQuickActionCategories([]);
    }
  };

  const closeQuickAction = () => {
    setQuickActionType(null);
    setQuickActionError(null);
  };

  const handleQuickActionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.categoryId.trim() || Number(form.amount) <= 0) {
      window.alert("Vui lòng nhập đầy đủ thông tin hợp lệ.");
      return;
    }

    try {
      setQuickActionSaving(true);

      const payload = {
        transactionDate: form.date,
        categoryId: Number(form.categoryId),
        amount: Number(form.amount),
        note: form.note.trim(),
      };

      if (quickActionType === "income") {
        await apiService.createIncome(payload);
      } else {
        await apiService.createExpense(payload);
      }

      closeQuickAction();
      const data = await apiService.getDashboard();
      setDashboardData(data);
    } catch (error) {
      setQuickActionError(extractApiError(error, "Không thể lưu giao dịch nhanh."));
    } finally {
      setQuickActionSaving(false);
    }
  };

  const isIncome = quickActionType === "income";
  const modalTitle = isIncome ? "Thêm thu nhập" : "Thêm chi tiêu";
  const amountPlaceholder = isIncome ? "Ví dụ: 2500000" : "Ví dụ: 350000";

  useEffect(() => {
    const fetchDashboard = async () => {
      setDashboardLoading(true);
      setDashboardError(null);

      try {
        const now = new Date();
        const toDate = now.toISOString().slice(0, 10);
        const from = new Date(now);
        from.setDate(now.getDate() - 6);
        const fromDate = from.toISOString().slice(0, 10);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

        const [data, weeklyIncomes, weeklyExpenses, monthlyExpenses] = await Promise.all([
          apiService.getDashboard(),
          apiService.getIncomes({ page: 0, size: 100, fromDate, toDate }),
          apiService.getExpenses({ page: 0, size: 100, fromDate, toDate }),
          apiService.getExpenses({ page: 0, size: 100, fromDate: startOfMonth, toDate }),
        ]);

        setDashboardData(data);

        const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
        const weekTemplate: WeekFlowItem[] = dayLabels.map((day) => ({ day, income: 0, expense: 0 }));

        weeklyIncomes.content.forEach((item) => {
          const date = new Date(item.transactionDate);
          const index = (date.getDay() + 6) % 7;
          weekTemplate[index].income += Number(item.amount);
        });

        weeklyExpenses.content.forEach((item) => {
          const date = new Date(item.transactionDate);
          const index = (date.getDay() + 6) % 7;
          weekTemplate[index].expense += Number(item.amount);
        });

        setWeeklyFlow(weekTemplate);

        const totalMonthlyExpense = monthlyExpenses.content.reduce((sum, item) => sum + Number(item.amount), 0);
        const expenseByCategory = monthlyExpenses.content.reduce<Record<string, number>>((acc, item) => {
          const key = item.categoryName;
          acc[key] = (acc[key] ?? 0) + Number(item.amount);
          return acc;
        }, {});

        const split = Object.entries(expenseByCategory)
          .map(([label, amount]) => ({
            label,
            value: totalMonthlyExpense > 0 ? Number(((amount / totalMonthlyExpense) * 100).toFixed(1)) : 0,
          }))
          .sort((a, b) => b.value - a.value);

        setCategorySplit(split);
      } catch (error) {
        setDashboardError(extractApiError(error, "Không thể tải dữ liệu dashboard."));
      } finally {
        setDashboardLoading(false);
      }
    };

    void fetchDashboard();
  }, []);

  const dynamicMetrics = useMemo(() => {
    if (!dashboardData) {
      return dashboardMetrics;
    }

    const savingRate = dashboardData.totalIncome > 0 ? (dashboardData.totalBalance / dashboardData.totalIncome) * 100 : 0;

    const currency = (value: number) =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(value);

    return [
      { label: "Tổng số dư", value: currency(dashboardData.totalBalance), change: "Live", icon: "Wallet", positive: true },
      { label: "Thu nhập tháng", value: currency(dashboardData.monthlyIncome), change: "Live", icon: "ArrowDownRight", positive: true },
      { label: "Chi tiêu tháng", value: currency(dashboardData.monthlyExpense), change: "Live", icon: "ArrowUpRight", positive: false },
      { label: "Tỷ lệ tiết kiệm", value: `${savingRate.toFixed(1)}%`, change: "Live", icon: "PiggyBank", positive: savingRate >= 0 },
    ];
  }, [dashboardData]);

  const recentRows = useMemo(() => {
    if (!dashboardData) {
      return undefined;
    }

    return mapApiTransactions(dashboardData.recentTransactions);
  }, [dashboardData]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  const monthlyIncome = dashboardData?.monthlyIncome ?? 0;
  const monthlyExpense = dashboardData?.monthlyExpense ?? 0;
  const monthlyBalance = monthlyIncome - monthlyExpense;
  const expenseRate = monthlyIncome > 0 ? (monthlyExpense / monthlyIncome) * 100 : 0;
  const savingRate = monthlyIncome > 0 ? Math.max(0, (monthlyBalance / monthlyIncome) * 100) : 0;
  const budgetHealth = Math.max(0, 100 - expenseRate);

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
                  onClick={() => void openQuickAction("income")}
                  className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-5 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/25"
                >
                  + Thêm thu nhập
                </button>
                <button
                  type="button"
                  onClick={() => void openQuickAction("expense")}
                  className="inline-flex items-center justify-center rounded-2xl border border-rose-300/40 bg-rose-400/10 px-5 py-2.5 text-sm font-medium text-rose-100 transition hover:bg-rose-400/20"
                >
                  + Thêm chi tiêu
                </button>
                <Link
                  to="/category"
                  className="inline-flex items-center justify-center rounded-2xl border border-emerald-300/40 bg-emerald-400/10 px-5 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
                >
                  + Thêm danh mục
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Thu tháng", formatCurrency(monthlyIncome)],
                ["Chi tháng", formatCurrency(monthlyExpense)],
                ["Số dư tháng", formatCurrency(monthlyBalance)],
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
                { label: "Tổng thu tích lũy", value: formatCurrency(dashboardData?.totalIncome ?? 0) },
                { label: "Tổng chi tích lũy", value: formatCurrency(dashboardData?.totalExpense ?? 0) },
                { label: "Tổng số dư hiện tại", value: formatCurrency(dashboardData?.totalBalance ?? 0) },
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
        {dynamicMetrics.map((metric) => {
          const Icon = icons[metric.icon as keyof typeof icons];

          return <MetricCard key={metric.label} {...metric} icon={Icon} />;
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <ChartCard data={weeklyFlow} />
        <CategoryCard categories={categorySplit} spentPercent={expenseRate} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <div className="space-y-3">
          {dashboardLoading && <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">Đang tải giao dịch gần đây...</div>}
          {dashboardError && <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{dashboardError}</div>}
          <TransactionList transactions={recentRows} />
        </div>

        <article className="glass-panel rounded-3xl p-5">
          <div>
            <p className="text-sm text-slate-400">Sức khỏe ngân sách</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Tổng kết theo tháng</h3>
          </div>

          <div className="mt-6 space-y-4">
            {[
              { label: "Hiệu suất thu - chi", value: `${budgetHealth.toFixed(1)}%` },
              { label: "Tỷ lệ chi tiêu tháng", value: `${expenseRate.toFixed(1)}%` },
              { label: "Tỷ lệ tiết kiệm tháng", value: `${savingRate.toFixed(1)}%` },
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
            <p className="text-sm text-cyan-100">Dữ liệu tổng kết đang được tính theo số liệu thật từ backend và cập nhật theo phiên làm việc hiện tại.</p>
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
              {quickActionError && <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{quickActionError}</p>}

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

                <div className="md:col-span-2">
                  <label htmlFor="quick-category" className="mb-2 block text-sm text-slate-300">
                    Danh mục
                  </label>
                  <select
                    id="quick-category"
                    value={form.categoryId}
                    onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  >
                    <option value="">Chọn danh mục</option>
                    {quickActionCategories.map((category) => (
                      <option key={category.id} value={category.id} className="bg-slate-900">{category.name}</option>
                    ))}
                  </select>
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
                  disabled={quickActionSaving}
                  className="rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/25"
                >
                  {quickActionSaving ? "Đang lưu..." : "Lưu nhanh"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}