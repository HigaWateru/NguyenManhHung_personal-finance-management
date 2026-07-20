import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { fetchExchangeRates, syncExchangeRates } from "../../redux/slides/exchangeRateSlide"
import { formatCurrency } from "../../utils/format"
import { triggerNotificationRefresh } from "../../utils/notification"
import { useLanguage } from "../../context/LanguageContext"
import type { CurrencyCode } from "../../types/api"
import { TrendingUp, TrendingDown, Coins, RefreshCw, Calculator, Calendar, AlertTriangle, ArrowRightLeft,
  DollarSign, Globe } from "lucide-react"

export default function ExchangeRatePage() {
  const dispatch = useAppDispatch()
  const { t } = useLanguage()
  
  // Redux state
  const { rates, loading, error } = useAppSelector((state) => state.exchangeRate)
  
  // Local state for converter
  const [convertAmount, setConvertAmount] = useState<string>("100")
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>("USD")
  const [toCurrency, setToCurrency] = useState<CurrencyCode>("VND")
  const [convertedResult, setConvertedResult] = useState<number | null>(null)

  // Load exchange rates on mount
  useEffect(() => {
    dispatch(fetchExchangeRates())
  }, [dispatch])

  // Recalculate conversion whenever inputs or rates change
  useEffect(() => {
    if (!rates || rates.length === 0) return

    const amount = parseFloat(convertAmount)
    if (isNaN(amount) || amount <= 0) {
      setConvertedResult(null)
      return
    }

    const fromRateObj = rates.find((r) => r.currencyCode === fromCurrency)
    const toRateObj = rates.find((r) => r.currencyCode === toCurrency)

    if (fromRateObj && toRateObj) {
      const result = (amount * fromRateObj.rateToVnd) / toRateObj.rateToVnd
      setConvertedResult(result)
    }
  }, [convertAmount, fromCurrency, toCurrency, rates])

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  // Get USD rate object as baseline
  const usdRateObj = rates.find((r) => r.currencyCode === "USD")
  const usdToVnd = usdRateObj?.rateToVnd || 25450

  // Calculate rate in USD ($) for any currency
  const getRateInUsd = (rateToVnd: number, code: CurrencyCode): string => {
    if (code === "USD") return "$1.0000"
    if (code === "VND") {
      const usdInVnd = usdToVnd
      return `$${(1 / usdInVnd).toFixed(6)}`
    }
    const rateInUsd = rateToVnd / usdToVnd
    return `$${rateInUsd.toFixed(4)}`
  }

  const getRateFluctuationBadge = (change: number | null) => {
    if (change === null || change === undefined) return <span className="text-slate-400 font-normal">-</span>
    
    const isPositive = change >= 0
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
        isPositive 
          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10" 
          : "bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm shadow-rose-500/10"
      }`}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {isPositive ? "+" : ""}{change.toFixed(2)}%
      </span>
    )
  }

  const handleSyncRates = async () => {
    const resultAction = await dispatch(syncExchangeRates())
    if (syncExchangeRates.fulfilled.match(resultAction)) triggerNotificationRefresh()
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-6 md:p-8 backdrop-blur-xl">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300 font-medium">
              <Globe size={14} className="animate-pulse text-cyan-400" />
              <span>{t("rate_hero_tag")}</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{t("rate_hero_title")}</h2>
            <p className="text-slate-400 max-w-3xl text-sm leading-6">
              {t("rate_hero_desc")}
            </p>
          </div>

          <button 
            onClick={handleSyncRates} 
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-white disabled:opacity-50 transition-all duration-200 shadow-lg shadow-cyan-500/10 shrink-0 cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-cyan-400" : "text-cyan-400"} />
            <span>{loading ? t("rate_updating") : t("rate_update_btn")}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">
          <AlertTriangle className="shrink-0 text-rose-400" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Grid containing rates list and converter */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Live Rates Table */}
        <div className="glass-panel lg:col-span-2 rounded-3xl border border-white/10 bg-slate-900/40 p-6 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400 border border-blue-500/20">
                <DollarSign size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white">{t("rate_table_title")}</h3>
                <p className="text-xs text-slate-400">{t("rate_table_sub")}</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 border border-white/10">
              <Coins size={14} className="text-cyan-400" />
              <span>Base: 1 USD ($)</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pl-4">{t("rate_col_currency")}</th>
                  <th className="pb-3 text-right">{t("rate_col_usd_base")}</th>
                  <th className="pb-3 text-right">{t("rate_col_vnd_equiv")}</th>
                  <th className="pb-3 text-center">{t("rate_col_24h_change")}</th>
                  <th className="pb-3 pr-4 text-right">{t("rate_col_updated")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rates.map((rate) => (
                  <tr key={rate.id} className="text-sm transition-colors hover:bg-white/5">
                    <td className="py-4 pl-4 font-medium text-white flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-cyan-400 font-bold border border-white/10">
                        {rate.symbol}
                      </div>
                      <div>
                        <div className="font-bold text-white text-base">{rate.currencyCode}</div>
                        <div className="text-xs text-slate-400">{rate.currencyName}</div>
                      </div>
                    </td>
                    <td className="py-4 text-right font-bold text-cyan-300 text-base">
                      {getRateInUsd(rate.rateToVnd, rate.currencyCode)}
                    </td>
                    <td className="py-4 text-right font-semibold text-slate-200">
                      {formatCurrency(rate.rateToVnd, "VND")}
                    </td>
                    <td className="py-4 text-center">
                      {getRateFluctuationBadge(rate.rateChangePercent)}
                    </td>
                    <td className="py-4 pr-4 text-right text-xs text-slate-400">
                      <div className="flex items-center justify-end gap-1.5">
                        <Calendar size={12} className="text-slate-500" />
                        <span>{new Date(rate.updatedAt).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit"
                        })}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {rates.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      {t("no_data")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Converter Calculator */}
        <div className="glass-panel lg:col-span-1 rounded-3xl border border-white/10 bg-slate-900/40 p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-400 border border-cyan-500/20">
              <Calculator size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-white">{t("rate_converter_title")}</h3>
              <p className="text-xs text-slate-400">{t("rate_converter_sub")}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="convert-amount" className="block text-xs font-medium text-slate-400 mb-2">{t("rate_converter_amount")}</label>
              <div className="relative">
                <input id="convert-amount" type="number" min="0.01" step="any" value={convertAmount}
                  onChange={(e) => setConvertAmount(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white font-semibold text-lg focus:border-cyan-500 focus:outline-none transition-colors"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
              <div>
                <label htmlFor="from-currency" className="block text-xs font-medium text-slate-400 mb-2">{t("rate_converter_from")}</label>
                <select id="from-currency" value={fromCurrency} 
                  onChange={(e) => setFromCurrency(e.target.value as CurrencyCode)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-3 text-white font-semibold focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="VND">VND (₫)</option>
                </select>
              </div>

              <div className="flex justify-center pt-6">
                <button type="button" onClick={handleSwapCurrencies}
                  className="rounded-full border border-white/10 bg-white/5 p-3 text-slate-300 hover:bg-cyan-500 hover:text-white transition-all duration-200 shadow-md cursor-pointer"
                  aria-label="Đổi chiều quy đổi"
                >
                  <ArrowRightLeft size={16} />
                </button>
              </div>

              <div>
                <label htmlFor="to-currency" className="block text-xs font-medium text-slate-400 mb-2">{t("rate_converter_to")}</label>
                <select id="to-currency" value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value as CurrencyCode)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-3 text-white font-semibold focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="VND">VND (₫)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-cyan-950/40 border border-cyan-800/30 p-5 space-y-2">
            <span className="text-xs uppercase tracking-wider text-cyan-400/90 font-semibold">{t("rate_converter_result")}</span>
            <div className="text-3xl font-bold text-white tracking-tight">
              {convertedResult !== null ? formatCurrency(convertedResult, toCurrency) : "---"}
            </div>
            {convertedResult !== null && (
              <p className="text-xs text-slate-400 italic pt-1 border-t border-cyan-900/40">
                1 {fromCurrency} = {formatCurrency((rates.find(r => r.currencyCode === fromCurrency)?.rateToVnd ?? 1) / (rates.find(r => r.currencyCode === toCurrency)?.rateToVnd ?? 1), toCurrency)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
