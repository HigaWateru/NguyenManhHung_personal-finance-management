import CrudModulePage from "../../components/module/CrudModulePage";

const columns = [
  { key: "date", label: "Ngày" },
  { key: "source", label: "Nguồn thu" },
  { key: "category", label: "Danh mục" },
  { key: "amount", label: "Số tiền", align: "right" as const },
  { key: "note", label: "Ghi chú" },
];

const rows = [
  { date: "2026-07-10", source: "Lương công ty", category: "Lương", amount: "$2,450", note: "Lương tháng" },
  { date: "2026-07-08", source: "Khách hàng ABC", category: "Freelance", amount: "$620", note: "Dự án landing page" },
  { date: "2026-07-05", source: "Ngân hàng", category: "Lãi suất", amount: "$34", note: "Lãi tài khoản tiết kiệm" },
  { date: "2026-07-03", source: "Công ty", category: "Thưởng", amount: "$280", note: "Thưởng hiệu suất" },
  { date: "2026-07-01", source: "Khóa học online", category: "Thu nhập phụ", amount: "$95", note: "Bán khóa học" },
];

export default function IncomePage() {
  return (
    <CrudModulePage
      kicker="Giao dịch"
      title="Quản lý thu nhập"
      description="Không gian làm việc cho module Thu nhập: thêm giao dịch thu, tìm kiếm nhanh, lọc theo danh mục và theo dõi dòng tiền vào theo tháng."
      entities={["Thu nhập", "Danh mục (INCOME)"]}
      columns={columns}
      rows={rows}
      actionLabel="Thêm thu nhập"
      filterPlaceholder="Tìm nguồn thu, ghi chú, danh mục..."
    />
  );
}
