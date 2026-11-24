import { useState } from "react";
import RevenueExpenseChart from "../../../components/admin/RevenueExpenseChart.jsx";
import ExpenseCategory from "./expenseCategory.jsx";
import FinanceStatus from "./financeStatus.jsx";
import QuickActions from "./quickAction.jsx";
import RevenueCategory from "./revenueCategory.jsx";
import RecentTransaction from "./resentTransaction.jsx";

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export default function FinanceDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);

  return (
    <div className="mx-auto flex w-full min-w-0 flex-col gap-4 sm:gap-6">
      <FinanceStatus
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-4">
        <RevenueExpenseChart
          compact
          className="h-full min-w-0 xl:col-span-2"
        />
        <ExpenseCategory
          selectedMonth={selectedMonth}
        />
        <RevenueCategory
          selectedMonth={selectedMonth}
        />
      </div>

      <QuickActions />
      <RecentTransaction />
    </div>
  );
}