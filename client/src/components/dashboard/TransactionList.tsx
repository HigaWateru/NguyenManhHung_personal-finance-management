import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { recentTransactions } from "../../utils/mockData";

export default function TransactionList() {
  return (
    <article className="glass-panel rounded-3xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Hoạt động</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Giao dịch gần đây</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">5 bản ghi</span>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[620px] border-collapse text-sm">
          <thead className="bg-slate-900/80 text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left">Loại</th>
              <th className="px-4 py-3 text-left">Nội dung</th>
              <th className="px-4 py-3 text-left">Danh mục</th>
              <th className="px-4 py-3 text-left">Thời gian</th>
              <th className="px-4 py-3 text-right">Số tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-slate-950/40 text-slate-200">
            {recentTransactions.map((transaction) => {
              const isIncome = transaction.type === "income";

              return (
                <tr key={transaction.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${isIncome ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>
                      {isIncome ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                      {isIncome ? "Thu" : "Chi"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{transaction.title}</td>
                  <td className="px-4 py-3">{transaction.category}</td>
                  <td className="px-4 py-3 text-slate-400">{transaction.time}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${isIncome ? "text-emerald-300" : "text-rose-300"}`}>{transaction.amount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}