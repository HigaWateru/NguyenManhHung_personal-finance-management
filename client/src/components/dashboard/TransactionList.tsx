import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { useLanguage } from "../../context/LanguageContext"

type DashboardTransaction = {
  id: number
  title: string
  category: string
  amount: string
  time: string
  type: "income" | "expense"
}

type TransactionListProps = {
  transactions?: DashboardTransaction[]
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const { t } = useLanguage()
  const rows = transactions ?? []

  return (
    <article className="glass-panel rounded-3xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{t("nav_group_transactions")}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{t("dash_recent_title")}</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{rows.length} {t("nav_group_transactions")}</span>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-slate-400">{t("no_data")}</div>
        ) : (
          <table className="w-full min-w-[620px] border-collapse text-sm">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left">{t("cat_col_type")}</th>
                <th className="px-4 py-3 text-left">{t("cat_col_name")}</th>
                <th className="px-4 py-3 text-left">{t("col_category")}</th>
                <th className="px-4 py-3 text-left">{t("col_date")}</th>
                <th className="px-4 py-3 text-right">{t("col_amount")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-slate-950/40 text-slate-200">
              {rows.map((transaction) => {
                const isIncome = transaction.type === "income"

                return (
                  <tr key={transaction.id} className="hover:bg-white/5">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${isIncome ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>
                        {isIncome ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                        {isIncome ? t("cat_type_income") : t("cat_type_expense")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{transaction.title}</td>
                    <td className="px-4 py-3">{transaction.category}</td>
                    <td className="px-4 py-3 text-slate-400">{transaction.time}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${isIncome ? "text-emerald-300" : "text-rose-300"}`}>{transaction.amount}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </article>
  )
}
