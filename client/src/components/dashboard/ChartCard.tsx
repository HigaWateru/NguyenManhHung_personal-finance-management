import type { CurrencyCode } from "../../types/api"
import { formatCurrency } from "../../utils/format"
import { useLanguage } from "../../context/LanguageContext"

type WeekFlowItem = {
  day: string
  income: number
  expense: number
}

type ChartCardProps = {
  data?: WeekFlowItem[]
  currencyCode?: CurrencyCode
}

const defaultData: WeekFlowItem[] = [
  { day: "Mon", income: 72, expense: 44 },
  { day: "Tue", income: 88, expense: 55 },
  { day: "Wed", income: 64, expense: 49 },
  { day: "Thu", income: 92, expense: 58 },
  { day: "Fri", income: 77, expense: 61 },
  { day: "Sat", income: 96, expense: 67 },
  { day: "Sun", income: 84, expense: 52 },
]

export default function ChartCard({ data, currencyCode = "VND" }: ChartCardProps) {
  const { t } = useLanguage()
  const formatMoney = (value: number) => formatCurrency(value, currencyCode)
  const cashFlowByDay = data && data.length > 0 ? data : defaultData

  const maxValue = Math.max(1, ...cashFlowByDay.flatMap((item) => [item.income, item.expense]))

  const toPercent = (value: number) => (value / maxValue) * 100

  return (
    <article className="glass-panel rounded-3xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{t("dash_weekly_flow")}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{t("dash_weekly_flow_sub")}</h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 text-emerald-300">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" /> {t("nav_income")}
          </span>
          <span className="inline-flex items-center gap-1 text-rose-300">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-400" /> {t("nav_expense")}
          </span>
        </div>
      </div>

      <div className="mt-8 flex h-56 items-end gap-3">
        {cashFlowByDay.map((item) => (
          <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-44 w-full items-end justify-center gap-1 rounded-xl bg-slate-950/40 p-2">
              <div className="w-1/2 rounded-sm bg-gradient-to-t from-emerald-500 to-emerald-300"
                style={{ height: `${toPercent(item.income)}%` }}
                title={`${t("nav_income")}: ${formatMoney(item.income)}`}
              />
              <div className="w-1/2 rounded-sm bg-gradient-to-t from-rose-500 to-rose-300"
                style={{ height: `${toPercent(item.expense)}%` }}
                title={`${t("nav_expense")}: ${formatMoney(item.expense)}`}
              />
            </div>

            <div className="text-center">
              <p className="text-[10px] text-slate-400">{item.day}</p>
              <p className={`text-[10px] ${item.income - item.expense >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                {item.income - item.expense >= 0 ? "+" : ""}{formatMoney(item.income - item.expense)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}