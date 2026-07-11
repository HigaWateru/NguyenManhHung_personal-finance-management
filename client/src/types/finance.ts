export type NavItem = {
  label: string;
  path: string;
  icon: string;
  group: "Core" | "Transactions" | "Insights" | "Account";
};

export type DashboardMetric = {
  label: string;
  value: string;
  change: string;
  icon: string;
  positive: boolean;
};

export type Transaction = {
  id: number;
  title: string;
  category: string;
  amount: string;
  time: string;
  type: "income" | "expense";
};

export type ProgressItem = {
  label: string;
  value: number;
  color: string;
};