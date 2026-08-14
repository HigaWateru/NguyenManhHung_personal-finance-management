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

const formatIntegerString = (value: string, separator: string): string => {
  if (!value) return ""
  const parts = []
  for (let i = value.length; i > 0; i -= 3) {
    parts.unshift(value.slice(Math.max(0, i - 3), i))
  }
  return parts.join(separator)
}

export const formatNumberInput = (value: string, language: string): string => {
  if (!value) return ""

  const isVi = language === "vi"
  const decimalSeparator = isVi ? "," : "."
  const thousandsSeparator = isVi ? "." : ","

  // Strip all characters except digits and decimal separator
  const allowedChars = new RegExp(`[^\\d${decimalSeparator === ',' ? ',' : '\\.'}]`, "g")
  const cleanValue = value.replace(allowedChars, "")

  // If there are multiple decimal separators, only keep the first one
  const firstDecimalIdx = cleanValue.indexOf(decimalSeparator)
  if (firstDecimalIdx !== -1) {
    const beforeDecimal = cleanValue.slice(0, firstDecimalIdx)
    const afterDecimal = cleanValue.slice(firstDecimalIdx + 1).replace(new RegExp(`\\${decimalSeparator === '.' ? '\\.' : ','}`, "g"), "")
    const formattedInteger = formatIntegerString(beforeDecimal, thousandsSeparator)
    return `${formattedInteger}${decimalSeparator}${afterDecimal}`
  } else {
    return formatIntegerString(cleanValue, thousandsSeparator)
  }
}

export const parseNumberInput = (value: string, language: string): string => {
  if (!value) return ""
  const isVi = language === "vi"
  if (isVi) {
    return value.replace(/\./g, "").replace(/,/g, ".")
  } else {
    return value.replace(/,/g, "")
  }
}
