import React, { createContext, useContext, useState, useEffect } from "react"
import { translations, type Language, type TranslationKeys } from "../i18n/translations"

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: keyof TranslationKeys) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const STORAGE_KEY = "sf_language"

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language
    if (saved && (saved === "vi" || saved === "en" || saved === "ja")) return saved
    return "vi" // Default language
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
  }

  const t = (key: keyof TranslationKeys): string => {
    const currentDict = translations[language] || translations["vi"]
    return currentDict[key] || translations["vi"][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
