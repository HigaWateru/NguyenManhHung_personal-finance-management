import { useCallback, useEffect, useState } from "react"
import { Pencil, Plus, Trash2, X } from "lucide-react"
import { apiService } from "../../apis/service"
import { extractApiError } from "../../apis/http"
import type { CategoryType } from "../../types/api"
import { useLanguage } from "../../context/LanguageContext"

type CategoryStatus = "Hoạt động" | "Rà soát"

type CategoryRecord = {
  id: number
  name: string
  type: CategoryType
  records: number
  status: CategoryStatus
  description: string
}

type CategoryFormState = {
  name: string
  type: CategoryType
  status: CategoryStatus
  description: string
}

type FormErrors = Partial<Record<keyof CategoryFormState, string>>

const emptyForm = (): CategoryFormState => ({
  name: "",
  type: "EXPENSE",
  status: "Hoạt động",
  description: "",
})

const validateForm = (form: CategoryFormState): FormErrors => {
  const errors: FormErrors = {}

  if (!form.name.trim()) errors.name = "Tên danh mục không được để trống"
  if (form.description.length > 120) errors.description = "Mô tả tối đa 120 ký tự"

  return errors
}

export default function CategoryPage() {
  const { t } = useLanguage()
  const [records, setRecords] = useState<CategoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<CategoryFormState>(emptyForm())
  const [errors, setErrors] = useState<FormErrors>({})

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setApiError(null)

    try {
      const categories = await apiService.getCategories()
      setRecords(
        categories.map((item) => ({
          id: item.id,
          name: item.name,
          type: item.type,
          records: item.transactionCount || 0,
          status: "Hoạt động",
          description: item.description || "",
        })),
      )
    } catch (error) {
      setApiError(extractApiError(error, "Không thể tải danh sách danh mục."))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchCategories()
    }, 0)

    return () => clearTimeout(timer)
  }, [fetchCategories])

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setForm(emptyForm())
    setErrors({})
  }

  const openCreateModal = () => {
    setEditingId(null)
    setForm(emptyForm())
    setErrors({})
    setIsModalOpen(true)
  }

  const openEditModal = (record: CategoryRecord) => {
    setEditingId(record.id)
    setForm({
      name: record.name,
      type: record.type,
      status: record.status,
      description: record.description,
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    const record = records.find((item) => item.id === id)
    if (!record) return

    if (window.confirm(`Xóa danh mục "${record.name}"?`)) {
      try {
        await apiService.deleteCategory(id)
        await fetchCategories()
      } catch (error) {
        setApiError(extractApiError(error, "Xóa danh mục thất bại."))
      }
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationErrors = validateForm(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    const normalizedName = form.name.trim()
    const duplicated = records.some(
      (item) => item.id !== editingId && item.type === form.type && item.name.toLowerCase() === normalizedName.toLowerCase(),
    )

    if (duplicated) {
      setErrors({ name: "Tên danh mục đã tồn tại trong cùng loại" })
      return
    }

    const payload = {
      name: normalizedName,
      type: form.type,
      description: form.description.trim(),
    }

    try {
      if (editingId === null) await apiService.createCategory(payload)
      else await apiService.updateCategory(editingId, payload)

      await fetchCategories()
      closeModal()
    } catch (error) {
      setApiError(extractApiError(error, "Lưu danh mục thất bại."))
    }
  }

  return (
    <section className="space-y-6">
      <header className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">{t("cat_page_tag")}</p>
        <h3 className="mt-3 text-3xl font-semibold text-white">{t("cat_page_title")}</h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          {t("cat_page_desc")}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {[t("inc_page_title"), t("exp_page_title"), t("cat_chip_auto")].map((chip) => (
            <span key={chip} className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
              {chip}
            </span>
          ))}
        </div>
      </header>

      <article className="glass-panel rounded-3xl p-5">
        {loading && <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">{t("loading")}</p>}
        {apiError && <p className="mb-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{apiError}</p>}

        <div className="flex items-center justify-end">
          <button type="button" onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/25 cursor-pointer"
          >
            <Plus size={16} /> {t("dash_add_category")}
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left">{t("cat_col_name")}</th>
                <th className="px-4 py-3 text-left">{t("cat_col_type")}</th>
                <th className="px-4 py-3 text-right">{t("cat_col_count")}</th>
                <th className="px-4 py-3 text-left">{t("cat_col_status")}</th>
                <th className="px-4 py-3 text-left">{t("cat_col_desc")}</th>
                <th className="px-4 py-3 text-right">{t("col_actions")}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10 bg-slate-950/40 text-slate-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">{t("no_data")}</td>
                </tr>
              ) : (
                records.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-white">{row.name}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs ${row.type === "INCOME" ? "bg-cyan-400/15 text-cyan-100" : "bg-rose-400/15 text-rose-100"}`}>
                        {row.type === "INCOME" ? t("cat_type_income") : t("cat_type_expense")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{row.records}</td>
                    <td className="px-4 py-3">{row.status === "Hoạt động" ? t("cat_status_active") : t("cat_status_review")}</td>
                    <td className="px-4 py-3 text-slate-300">{row.description || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => openEditModal(row)}
                          className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-slate-200 transition hover:bg-white/10 cursor-pointer"
                        >
                          <Pencil size={14} /> {t("edit")}
                        </button>

                        <button type="button" onClick={() => handleDelete(row.id)}
                          className="inline-flex items-center gap-1 rounded-xl border border-rose-300/30 bg-rose-400/10 px-2.5 py-1.5 text-xs text-rose-100 transition hover:bg-rose-400/20 cursor-pointer"
                        >
                          <Trash2 size={14} /> {t("delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="glass-panel-strong w-full max-w-2xl rounded-3xl p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">{t("cat_page_title")}</p>
                <h4 className="mt-2 text-xl font-semibold text-white">{editingId === null ? t("dash_add_category") : t("edit")}</h4>
              </div>

              <button type="button" onClick={closeModal}
                className="rounded-xl border border-white/15 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 cursor-pointer"
                aria-label="Đóng"
              >
                <X size={16} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="category-name" className="mb-2 block text-sm text-slate-300">
                  {t("cat_col_name")}
                </label>
                <input id="category-name" type="text" value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="..."
                  className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                />
                  {errors.name && <p className="mt-1 text-xs text-rose-300">{errors.name}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="category-type" className="mb-2 block text-sm text-slate-300"> {t("cat_col_type")}</label>
                  <select id="category-type" value={form.type}
                    onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as CategoryType }))}
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45 cursor-pointer"
                  >
                    <option value="INCOME">{t("cat_type_income")}</option>
                    <option value="EXPENSE">{t("cat_type_expense")}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="category-status" className="mb-2 block text-sm text-slate-300">{t("cat_col_status")}</label>
                  <select id="category-status" value={form.status}
                    onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as CategoryStatus }))}
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45 cursor-pointer"
                  >
                    <option value="Hoạt động">{t("cat_status_active")}</option>
                    <option value="Rà soát">{t("cat_status_review")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="category-description" className="mb-2 block text-sm text-slate-300"> {t("cat_col_desc")} </label>
                <textarea id="category-description" rows={3} value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="..."
                  className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300/45"
                />
                  {errors.description && <p className="mt-1 text-xs text-rose-300">{errors.description}</p>}
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button type="button" onClick={closeModal}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 cursor-pointer"
                > 
                  {t("cancel")} 
                </button>

                <button type="submit"
                  className="rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/25 cursor-pointer"
                >
                  {t("save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
