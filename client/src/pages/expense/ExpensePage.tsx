import { useCallback, useEffect, useMemo, useState } from "react"
import { Pencil, Plus, Search, Trash2, X } from "lucide-react"
import { apiService } from "../../apis/service"
import { extractApiError } from "../../apis/http"
import type { CategoryItem } from "../../types/api"
import { useAppSelector } from "../../redux/hooks"
import { formatCurrency } from "../../utils/format"

type ExpenseRecord = {
  id: number
  date: string
  createdAt?: string
  categoryId: number
  category: string
  amount: number
  note: string
}

type ExpenseFormState = {
  date: string
  categoryId: string
  amount: string
  note: string
}

type FormErrors = Partial<Record<keyof ExpenseFormState, string>>;

const PAGE_SIZE = 10;

const emptyForm = (): ExpenseFormState => ({
  date: new Date().toISOString().slice(0, 10),
  categoryId: "",
  amount: "",
  note: "",
})

const validateForm = (form: ExpenseFormState): FormErrors => {
  const errors: FormErrors = {}

  if (!form.date.trim()) errors.date = "Vui lòng chọn ngày"
  if (!form.categoryId.trim()) errors.categoryId = "Vui lòng chọn danh mục"

  const amount = Number(form.amount)
  if (!form.amount.trim()) errors.amount = "Số tiền không được để trống"
  else if (!Number.isFinite(amount) || amount <= 0) errors.amount = "Số tiền phải lớn hơn 0"

  if (form.note.length > 255) errors.note = "Ghi chú tối đa 255 ký tự"

  return errors
}

export default function ExpensePage() {
  const { user } = useAppSelector((state) => state.auth)
  const currencyCode = user?.currencyCode || "VND"

  const [records, setRecords] = useState<ExpenseRecord[]>([])

  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ExpenseFormState>(emptyForm())
  const [errors, setErrors] = useState<FormErrors>({})

  const fetchData = useCallback(async () => {
    setLoading(true)
    setApiError(null)

    try {
      const [expensePage, expenseCategories] = await Promise.all([
        apiService.getExpenses({
          page: page - 1,
          size: PAGE_SIZE,
          keyword: query || undefined,
          categoryId: selectedCategory ? Number(selectedCategory) : undefined,
        }),
        apiService.getCategories("EXPENSE"),
      ])

      setRecords(
        expensePage.content.map((item) => ({
          id: item.id,
          date: item.transactionDate,
          createdAt: item.createdAt,
          categoryId: item.categoryId,
          category: item.categoryName,
          amount: Number(item.amount),
          note: item.note || "",
        })),
      );
      setTotalPages(Math.max(1, expensePage.totalPages));
      setTotalElements(expensePage.totalElements);
      setCategories(expenseCategories);
    } catch (error) {
      setApiError(extractApiError(error, "Không thể tải dữ liệu chi tiêu."));
    } finally {
      setLoading(false);
    }
  }, [page, query, selectedCategory, currencyCode])

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void fetchData()
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [fetchData])

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setForm(emptyForm())
    setErrors({})
  };

  const openCreateModal = () => {
    setEditingId(null)
    setForm(emptyForm())
    setErrors({})
    setIsModalOpen(true)
  };

  const openEditModal = (record: ExpenseRecord) => {
    setEditingId(record.id)
    setForm({
      date: record.date,
      categoryId: String(record.categoryId),
      amount: String(record.amount),
      note: record.note,
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa giao dịch chi tiêu này?")) return

    try {
      await apiService.deleteExpense(id)
      await fetchData()
    } catch (error) {
      setApiError(extractApiError(error, "Xóa giao dịch thất bại."))
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationErrors = validateForm(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    const payload = {
      transactionDate: form.date,
      categoryId: Number(form.categoryId),
      amount: Number(form.amount),
      note: form.note.trim(),
    }

    try {
      if (editingId === null) await apiService.createExpense(payload)
      else await apiService.updateExpense(editingId, payload)

      closeModal()
      await fetchData()
    } catch (error) {
      setApiError(extractApiError(error, "Lưu giao dịch chi tiêu thất bại."))
    }
  }

  const resultStart = totalElements === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const resultEnd = Math.min(page * PAGE_SIZE, totalElements)

  const selectedCategoryName = useMemo(
    () => categories.find((category) => String(category.id) === form.categoryId)?.name || "",
    [categories, form.categoryId],
  )

  return (
    <section className="space-y-6">
      <header className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Giao dịch</p>
        <h3 className="mt-3 text-3xl font-semibold text-white">Quản lý chi tiêu</h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Dữ liệu chi tiêu đã kết nối backend: CRUD, tìm kiếm và phân trang theo API thật.
        </p>
      </header>

      <article className="glass-panel rounded-3xl p-5">
        {loading && <p className="mb-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">Đang tải dữ liệu...</p>}
        {apiError && <p className="mb-3 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{apiError}</p>}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:w-full md:w-auto">
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-slate-300 md:w-[320px]">
              <Search size={16} className="text-cyan-300/80" />
              <input type="text" value={query} onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(1)
                }} placeholder="Tìm ghi chú hoặc danh mục..."
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
              />
            </label>

            <select
              value={selectedCategory}
              onChange={(event) => {
                setSelectedCategory(event.target.value)
                setPage(1)
              }}
              className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-slate-300 outline-none focus:border-cyan-300/40 sm:w-[200px]"
            >
              <option value="" className="bg-slate-900">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id} className="bg-slate-900">
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <button type="button" onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/25"
          >
            <Plus size={16} /> Thêm chi tiêu
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[880px] border-collapse text-sm">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left">Ngày</th>
                <th className="px-4 py-3 text-left">Danh mục</th>
                <th className="px-4 py-3 text-right">Số tiền</th>
                <th className="px-4 py-3 text-left">Ghi chú</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10 bg-slate-950/40 text-slate-200">
              {records.length > 0 ? (
                records.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 text-left">
                      <div className="font-medium text-slate-200">{row.date}</div>
                      {row.createdAt && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(row.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{row.category}</td>
                    <td className="px-4 py-3 text-right font-medium text-rose-100">{formatCurrency(row.amount, currencyCode)}</td>
                    <td className="px-4 py-3 text-slate-300">{row.note || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => openEditModal(row)}
                          className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
                        >
                          <Pencil size={14} /> Sửa
                        </button>

                        <button type="button" onClick={() => handleDelete(row.id)}
                          className="inline-flex items-center gap-1 rounded-xl border border-rose-300/30 bg-rose-400/10 px-2.5 py-1.5 text-xs text-rose-100 transition hover:bg-rose-400/20"
                        >
                          <Trash2 size={14} /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400"> Không có dữ liệu phù hợp. </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
          <p>Hiển thị {resultStart}-{resultEnd} trong tổng số {totalElements} bản ghi</p>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Trước
            </button>

            <span className="rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-3 py-1.5 text-cyan-100">{page} / {totalPages}</span>

            <button type="button" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
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
              <button type="button" onClick={closeModal}
                className="rounded-xl border border-white/15 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10"
                aria-label="Đóng"
              >
                <X size={16} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="expense-date" className="mb-2 block text-sm text-slate-300">Ngày</label>
                  <input id="expense-date" type="date" value={form.date}
                    onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  />
                  {errors.date && <p className="mt-1 text-xs text-rose-300">{errors.date}</p>}
                </div>

                <div>
                  <label htmlFor="expense-amount" className="mb-2 block text-sm text-slate-300">Số tiền</label>
                  <input id="expense-amount" type="number" min="0" value={form.amount}
                    onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                    placeholder="Ví dụ: 350000"
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  />
                  {errors.amount && <p className="mt-1 text-xs text-rose-300">{errors.amount}</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="expense-category" className="mb-2 block text-sm text-slate-300">Danh mục</label>
                  <select id="expense-category" value={form.categoryId}
                    onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                  >
                    <option value="">Chọn danh mục chi tiêu</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id} className="bg-slate-900">{category.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="mt-1 text-xs text-rose-300">{errors.categoryId}</p>}
                  {selectedCategoryName && <p className="mt-1 text-xs text-slate-400">Đang chọn: {selectedCategoryName}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="expense-note" className="mb-2 block text-sm text-slate-300">Ghi chú</label>
                <textarea id="expense-note" rows={3} value={form.note}
                  onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                  placeholder="Mô tả ngắn cho giao dịch"
                  className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                />
                {errors.note && <p className="mt-1 text-xs text-rose-300">{errors.note}</p>}
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button type="button" onClick={closeModal}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
                >
                  Hủy
                </button>

                <button type="submit"
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
  )
}
