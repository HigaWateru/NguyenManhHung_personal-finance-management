import { type LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  positive: boolean;
};

export default function MetricCard({ label, value, change, icon: Icon, positive }: MetricCardProps) {
  return (
    <article className="glass-panel rounded-3xl p-5 transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <h3 className="mt-3 text-3xl font-semibold text-white">{value}</h3>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-200">
          <Icon size={22} />
        </div>
      </div>

      <p className={`mt-6 text-sm font-medium ${positive ? "text-emerald-300" : "text-rose-300"}`}>{change} so với tháng trước</p>
    </article>
  );
}