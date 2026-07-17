import type { CurrencyCode } from "../types/api"

export const formatCurrency = (value: number, currencyCode: CurrencyCode = "VND") => {
  let locale = "vi-VN"
  let maxFraction = 0

  if (currencyCode === "USD") {
    locale = "en-US"
    maxFraction = 2
  } else if (currencyCode === "EUR") {
    locale = "de-DE"
    maxFraction = 2
  } else if (currencyCode === "JPY") {
    locale = "ja-JP"
    maxFraction = 0
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: maxFraction,
  }).format(value)
}
