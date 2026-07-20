import { useLanguage } from "../../context/LanguageContext"

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-white/10 bg-slate-950/70 px-4 py-5 text-sm text-slate-400 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>Personal Smart Finance · {t("header_subtitle")}</p>
        <p>© 2026 · Dev: Higa_Wateru</p>
        <p>React + TypeScript + Tailwind</p>
      </div>
    </footer>
  )
}