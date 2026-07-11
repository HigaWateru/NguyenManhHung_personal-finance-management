import CrudModulePage from "../../components/module/CrudModulePage";

const columns = [
  { key: "date", label: "Ngày" },
  { key: "merchant", label: "Đơn vị" },
  { key: "category", label: "Danh mục" },
  { key: "amount", label: "Số tiền", align: "right" as const },
  { key: "note", label: "Ghi chú" },
];

const rows = [
  { date: "2026-07-11", merchant: "Winmart", category: "Ăn uống", amount: "$48", note: "Mua thực phẩm tuần" },
  { date: "2026-07-10", merchant: "Grab", category: "Di chuyển", amount: "$13", note: "Đi làm" },
  { date: "2026-07-09", merchant: "EVN", category: "Tiện ích", amount: "$62", note: "Tiền điện" },
  { date: "2026-07-06", merchant: "Spotify", category: "Giải trí", amount: "$6", note: "Gói tháng" },
  { date: "2026-07-04", merchant: "Nhà thuốc", category: "Sức khỏe", amount: "$19", note: "Thuốc cơ bản" },
];

export default function ExpensePage() {
  return (
    <CrudModulePage
      kicker="Giao dịch"
      title="Quản lý chi tiêu"
      description="Không gian làm việc cho module Chi tiêu: ghi nhận khoản chi, quản lý danh sách, lọc theo thời gian và phân tích hành vi chi tiêu."
      entities={["Chi tiêu", "Danh mục (EXPENSE)"]}
      columns={columns}
      rows={rows}
      actionLabel="Thêm chi tiêu"
      filterPlaceholder="Tìm đơn vị, ghi chú, danh mục..."
    />
  );
}
