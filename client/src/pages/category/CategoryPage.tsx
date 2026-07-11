import CrudModulePage from "../../components/module/CrudModulePage";

const columns = [
  { key: "name", label: "Tên danh mục" },
  { key: "type", label: "Loại" },
  { key: "records", label: "Giao dịch", align: "right" as const },
  { key: "status", label: "Trạng thái" },
  { key: "description", label: "Mô tả" },
];

const rows = [
  { name: "Lương", type: "INCOME", records: "12", status: "Hoạt động", description: "Nguồn thu nhập chính" },
  { name: "Freelance", type: "INCOME", records: "8", status: "Hoạt động", description: "Dự án ngoài" },
  { name: "Ăn uống", type: "EXPENSE", records: "37", status: "Hoạt động", description: "Ăn uống và thực phẩm" },
  { name: "Di chuyển", type: "EXPENSE", records: "21", status: "Hoạt động", description: "Taxi, xe buýt, xăng" },
  { name: "Mua sắm", type: "EXPENSE", records: "9", status: "Rà soát", description: "Thời trang và thiết bị" },
];

export default function CategoryPage() {
  return (
    <CrudModulePage
      kicker="Dữ liệu gốc"
      title="Quản lý danh mục"
      description="Không gian quản lý danh mục cho Thu nhập/Chi tiêu, bảo đảm tính duy nhất theo người dùng và quy tắc xóa an toàn khi đã phát sinh giao dịch."
      entities={["Danh mục", "Loại danh mục (INCOME | EXPENSE)"]}
      columns={columns}
      rows={rows}
      actionLabel="Tạo danh mục"
      filterPlaceholder="Tìm danh mục theo tên hoặc loại..."
    />
  );
}
