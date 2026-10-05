import { Users, Briefcase, Folder, Ticket } from "lucide-react";

// Adjust these import paths to match your project structure.
import PageWrapper from "../../components/PageWrapper.jsx";
import StatCard from "../../components/StatCard.jsx";
import RevenueExpenseChart from "../../components/RevenueExpenseChart";
import ProjectStatusChart from "../../components/ProjectStatusChart.jsx";
import RecentUsers from "../../components/RecenUsers.jsx";
import ActivityFeed from "../../components/ActivityFeed";

/* -------------------------------------------------------------------------- */
/* Mock data — lets the full UI render without a backend.                     */
/* Later, replace these constants with data from a hook/service in this page  */
/* (the UI components below only receive data through props).                 */
/* -------------------------------------------------------------------------- */

const MOCK_STATS = [
  { id: "employees", label: "Total Employees", value: "247", change: 12, icon: Users },
  { id: "customers", label: "Total Customers", value: "1,842", change: 89, icon: Briefcase },
  { id: "projects", label: "Active Projects", value: "38", change: 3, icon: Folder },
  // Fewer open tickets is good: down arrow, green pill.
  { id: "tickets", label: "Open Tickets", value: "124", change: -8, changeType: "positive", icon: Ticket },
];

const MOCK_REVENUE_DATA = [
  { month: "Jan", revenue: 140000, expenses: 90000 },
  { month: "Feb", revenue: 158000, expenses: 92000 },
  { month: "Mar", revenue: 148000, expenses: 88000 },
  { month: "Apr", revenue: 188000, expenses: 100000 },
  { month: "May", revenue: 200000, expenses: 107000 },
  { month: "Jun", revenue: 228000, expenses: 115000 },
  { month: "Jul", revenue: 222000, expenses: 112000 },
  { month: "Aug", revenue: 252000, expenses: 120000 },
  { month: "Sep", revenue: 265000, expenses: 127000 },
];

const MOCK_PROJECT_STATUS = [
  { name: "On Track", value: 18, color: "#059669" },
  { name: "At Risk", value: 9, color: "#d97706" },
  { name: "Delayed", value: 6, color: "#dc2626" },
  { name: "Completed", value: 5, color: "#4f46e5" },
];

const MOCK_USERS = [
  { id: 1, name: "Sarah Chen", email: "sarah.chen@acme.com", role: "Manager", status: "active", joined: "Sep 22, 2026" },
  { id: 2, name: "Marcus Webb", email: "m.webb@acme.com", role: "Employee", status: "active", joined: "Sep 20, 2026" },
  { id: 3, name: "Priya Nair", email: "p.nair@acme.com", role: "Employee", status: "pending", joined: "Sep 19, 2026" },
  { id: 4, name: "James Holloway", email: "j.holloway@acme.com", role: "Manager", status: "active", joined: "Sep 17, 2026" },
  { id: 5, name: "Aisha Okonkwo", email: "a.okonkwo@acme.com", role: "Employee", status: "inactive", joined: "Sep 15, 2026" },
];

const MOCK_ACTIVITIES = [
  { id: 1, user: "Sarah Chen", action: "completed task", target: "API Integration Review", time: "5 min ago" },
  { id: 2, user: "Marcus Webb", action: "commented on", target: "TKT-1021", time: "22 min ago" },
  { id: 3, user: "Priya Nair", action: "uploaded file to", target: "Q3 Report", time: "1h ago" },
  { id: 4, user: "Acme Corp", action: "created ticket", target: "TKT-1022", time: "2h ago" },
  { id: 5, user: "James Holloway", action: "updated status of", target: "Platform v3 Launch", time: "3h ago" },
  { id: 6, user: "Aisha Okonkwo", action: "assigned", target: "TKT-1018", time: "5h ago" },
];

/* -------------------------------------------------------------------------- */

export default function AdminDashboard() {
  return (
    <PageWrapper>
      {/* Top: stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        {MOCK_STATS.map(({ id, ...stat }) => (
          <StatCard key={id} {...stat} />
        ))}
      </div>

      {/* Middle: revenue chart (2/3) + project status (1/3) */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <RevenueExpenseChart
          data={MOCK_REVENUE_DATA}
          className="h-full lg:col-span-2"
        />
        <ProjectStatusChart data={MOCK_PROJECT_STATUS} className="h-full" />
      </div>

      {/* Bottom: recent users (2/3) + activity feed (1/3) */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <RecentUsers users={MOCK_USERS} className="lg:col-span-2" />

        {/*
          On large screens the feed is absolutely positioned inside this wrapper,
          so the row height is set by Recent Users and the feed scrolls to fit it.
          Below `lg` it flows normally and uses a capped height.
        */}
        <div className="relative">
          <ActivityFeed
            activities={MOCK_ACTIVITIES}
            className="h-full lg:absolute lg:inset-0"
            scrollClassName="max-h-80 lg:max-h-none"
          />
        </div>
      </div>
    </PageWrapper>
  );
}