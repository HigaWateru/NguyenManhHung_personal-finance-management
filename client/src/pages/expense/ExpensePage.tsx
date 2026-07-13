import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

type ExpenseRecord = {
  id: number;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  note: string;
};

type ExpenseFormState = {
  date: string;
  merchant: string;
  category: string;
  amount: string;
  note: string;
};

type FormErrors = Partial<Record<keyof ExpenseFormState, string>>;

const PAGE_SIZE = 5;

const initialRecords: ExpenseRecord[] = [
  { id: 1, date: "2026-07-12", merchant: "WinMart", category: "Ăn uống", amount: 820000, note: "Mua thực phẩm tuần" },
  { id: 2, date: "2026-07-11", merchant: "Grab", category: "Di chuyển", amount: 145000, note: "Đi làm" },
  { id: 3, date: "2026-07-10", merchant: "EVN", category: "Tiện ích", amount: 1260000, note: "Hóa đơn điện" },
  { id: 4, date: "2026-07-08", merchant: "CGV", category: "Giải trí", amount: 220000, note: "Xem phim" },
  { id: 5, date: "2026-07-07", merchant: "Nhà thuốc Long Châu", category: "Sức khỏe", amount: 315000, note: "Thuốc cảm" },
  { id: 6, date: "2026-07-05", merchant: "Shopee", category: "Mua sắm", amount: 540000, note: "Đồ gia dụng" },
  { id: 7, date: "2026-07-03", merchant: "Highlands Coffee", category: "Ăn uống", amount: 89000, note: "Làm việc cuối tuần" },
  { id: 8, date: "2026-07-01", merchant: "VinFast Charging", category: "Di chuyển", amount: 180000, note: "Sạc xe điện" },
  { id: 9, date: "2026-06-29", merchant: "Netflix", category: "Giải trí", amount: 260000, note: "Gói tháng" },
  { id: 10, date: "2026-06-26", merchant: "Circle K", category: "Ăn uống", amount: 76000, note: "Ăn nhẹ" },
  { id: 11, date: "2026-06-24", merchant: "Co.opmart", category: "Ăn uống", amount: 690000, note: "Đồ dùng gia đình" },
  { id: 12, date: "2026-06-21", merchant: "FPT Telecom", category: "Tiện ích", amount: 330000, note: "Internet tháng" },
];

const emptyForm = (): ExpenseFormState => ({
  date: new Date().toISOString().slice(0, 10),
  merchant: "",
  category: "",
  amount: "",
  note: "",
});

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const validateForm = (form: ExpenseFormState): FormErrors => {
  const errors: FormErrors = {};

  if (!form.date.trim()) errors.date = "Vui lòng chọn ngày";
  if (!form.merchant.trim()) errors.merchant = "Đơn vị không được để trống";
  if (!form.category.trim()) errors.category = "Danh mục không được để trống";

  const amount = Number(form.amount);
  if (!form.amount.trim()) {
    errors.amount = "Số tiền không được để trống";
  } else if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Số tiền phải lớn hơn 0";
  }

  if (form.note.length > 120) {
    errors.note = "Ghi chú tối đa 120 ký tự";
  }

  return errors;
};

export default function ExpensePage() {
  const [records, setRecords] = useState<ExpenseRecord[]>(initialRecords);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ExpenseFormState>(emptyForm());
  const [errors, setErrors] = useState<FormErrors>({});

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return records;

    return records.filter((record) => {
      const searchable = `${record.date} ${record.merchant} ${record.category} ${record.note} ${record.amount}`.toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [records, query]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const activePage = Math.min(page, totalPages);

  const currentPageRows = useMemo(() => {
    const start = (activePage - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, activePage]);

  const paginationNumbers = useMemo(() => {
    const start = Math.max(1, activePage - 1);
    const end = Math.min(totalPages, start + 2);
    const adjustedStart = Math.max(1, end - 2);

    return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
  }, [activePage, totalPages]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    setErrors({});
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm());
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (record: ExpenseRecord) => {
    setEditingId(record.id);
    setForm({
      date: record.date,
      merchant: record.merchant,
      category: record.category,
      amount: String(record.amount),
      note: record.note,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    const record = records.find((item) => item.id === id);
    if (!record) return;

    if (window.confirm(`Xóa giao dịch tại "${record.merchant}"?`)) {
      setRecords((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload: Omit<ExpenseRecord, "id"> = {
      date: form.date,
      merchant: form.merchant.trim(),
      category: form.category.trim(),
      amount: Number(form.amount),
      note: form.note.trim(),
    };

    if (editingId === null) {
      const nextId = records.length > 0 ? Math.max(...records.map((item) => item.id)) + 1 : 1;
      setRecords((prev) => [
        { id: nextId, ...payload },
        ...prev,
      ]);
      setPage(1);
    } else {
      setRecords((prev) => prev.map((item) => (item.id === editingId ? { id: editingId, ...payload } : item)));
    }

    closeModal();
  };

  const resultStart = filteredRecords.length === 0 ? 0 : (activePage - 1) * PAGE_SIZE + 1;
  const resultEnd = Math.min(activePage * PAGE_SIZE, filteredRecords.length);

  return (
    <section className="space-y-6">
      <header className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Giao dịch</p>
        <h3 className="mt-3 text-3xl font-semibold text-white">Quản lý chi tiêu</h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Ghi nhận và quản lý mọi khoản chi với luồng thao tác CRUD đầy đủ, tìm kiếm tức thì theo từ khóa và phân trang rõ ràng để kiểm soát ngân sách hiệu quả.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {["Chi tiêu", "Danh mục (EXPENSE)", "Search + Pagination"].map((chip) => (
            <span key={chip} className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
              {chip}
            </span>
          ))}
        </div>
      </header>

      <article className="glass-panel rounded-3xl p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-slate-300 md:w-[420px]">
            <Search size={16} className="text-cyan-300/80" />
            <input
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Tìm đơn vị, ghi chú, danh mục..."
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
            />
          </label>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/25"
          >
            <Plus size={16} />
            Thêm chi tiêu
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[880px] border-collapse text-sm">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left">Ngày</th>
                <th className="px-4 py-3 text-left">Đơn vị</th>
                <th className="px-4 py-3 text-left">Danh mục</th>
                <th className="px-4 py-3 text-right">Số tiền</th>
                <th className="px-4 py-3 text-left">Ghi chú</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10 bg-slate-950/40 text-slate-200">
              {currentPageRows.length > 0 ? (
                currentPageRows.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5">
                    <td className="px-4 py-3">{row.date}</td>
                    <td className="px-4 py-3">{row.merchant}</td>
                    <td className="px-4 py-3">{row.category}</td>
                    <td className="px-4 py-3 text-right font-medium text-rose-100">{formatCurrency(row.amount)}</td>
                    <td className="px-4 py-3 text-slate-300">{row.note || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(row)}
                          className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
                        >
                          <Pencil size={14} />
                          Sửa
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          className="inline-flex items-center gap-1 rounded-xl border border-rose-300/30 bg-rose-400/10 px-2.5 py-1.5 text-xs text-rose-100 transition hover:bg-rose-400/20"
                        >
                          <Trash2 size={14} />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    Không có dữ liệu phù hợp với từ khóa tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
          <p>
            Hiển thị {resultStart}-{resultEnd} trong tổng số {filteredRecords.length} bản ghi
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={activePage === 1}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Trước
            </button>

            {paginationNumbers.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                className={`rounded-xl px-3 py-1.5 ${
                  item === activePage
                    ? "border border-cyan-300/40 bg-cyan-400/10 text-cyan-100"
                    : "border border-white/10 bg-white/5 text-slate-300"
                }`}
              >
                {item}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={activePage === totalPages}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      </article>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="glass-panel-strong w-full max-w-2xl rounded-3xl p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">Expense Form</p>
                <h4 className="mt-2 text-xl font-semibold text-white">{editingId === null ? "Thêm chi tiêu" : "Cập nhật chi tiêu"}</h4>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-white/15 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10"
                aria-label="Đóng"
              >
                <X size={16} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="expense-date" className="mb-2 block text-sm text-slate-300">
                    Ngày
                  </label>
                  <input
                    id="expense-date"
                    type="date"
                    value={form.date}
                    onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  />
                  {errors.date && <p className="mt-1 text-xs text-rose-300">{errors.date}</p>}
                </div>

                <div>
                  <label htmlFor="expense-amount" className="mb-2 block text-sm text-slate-300">
                    Số tiền
                  </label>
                  <input
                    id="expense-amount"
                    type="number"
                    min="0"
                    value={form.amount}
                    onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                    placeholder="Ví dụ: 250000"
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  />
                  {errors.amount && <p className="mt-1 text-xs text-rose-300">{errors.amount}</p>}
                </div>

                <div>
                  <label htmlFor="expense-merchant" className="mb-2 block text-sm text-slate-300">
                    Đơn vị
                  </label>
                  <input
                    id="expense-merchant"
                    type="text"
                    value={form.merchant}
                    onChange={(event) => setForm((prev) => ({ ...prev, merchant: event.target.value }))}
                    placeholder="Ví dụ: WinMart"
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  />
                  {errors.merchant && <p className="mt-1 text-xs text-rose-300">{errors.merchant}</p>}
                </div>

                <div>
                  <label htmlFor="expense-category" className="mb-2 block text-sm text-slate-300">
                    Danh mục
                  </label>
                  <input
                    id="expense-category"
                    type="text"
                    value={form.category}
                    onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                    placeholder="Ví dụ: Ăn uống"
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  />
                  {errors.category && <p className="mt-1 text-xs text-rose-300">{errors.category}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="expense-note" className="mb-2 block text-sm text-slate-300">
                  Ghi chú
                </label>
                <textarea
                  id="expense-note"
                  rows={3}
                  value={form.note}
                  onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                  placeholder="Mô tả ngắn cho giao dịch"
                  className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                />
                {errors.note && <p className="mt-1 text-xs text-rose-300">{errors.note}</p>}
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/25"
                >
                  {editingId === null ? "Lưu giao dịch" : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
