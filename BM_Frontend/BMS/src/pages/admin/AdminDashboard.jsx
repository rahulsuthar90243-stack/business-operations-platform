import { Users, Briefcase, Folder, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getAdminCardStats,
  getAllUser,
  getProjectStatus,
} from "../../services/adminService.js";
import { mapRecentUsers } from "../../services/recentUser.js";

import PageWrapper from "../../components/PageWrapper.jsx";
import StatCard from "../../components/StatCard.jsx";
import RevenueExpenseChart from "../../components/admin/RevenueExpenseChart.jsx";
import ProjectStatusChart from "../../components/admin/ProjectStatusChart.jsx";
import RecentUsers from "../../components/admin/RecenUsers.jsx";
import ActivityFeed from "../../components/admin/ActivityFeed.jsx";

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

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [projectStatus, setProjectStatus] = useState([]);
  const [adminStats, setAdminStats] = useState({
    totalEmployee: 0,
    totalCustomer: 0,
    activeProject: 0,
    openTicket: 0,
  });

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const stats = await getAdminCardStats();
        setAdminStats(stats);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      }
    };

    fetchAdminStats();
  }, []);

  useEffect(() => {
    const fetchProjectStatus = async () => {
      try {
        const statusData = await getProjectStatus();
        setProjectStatus(statusData);
      } catch (error) {
        console.error("Error fetching project status:", error);
      }
    };

    fetchProjectStatus();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await getAllUser();
        setUsers(mapRecentUsers(allUsers));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const statCards = [
    {
      id: "employees",
      label: "Total Employees",
      value: adminStats.totalEmployee ?? 0,
      icon: Users,
    },
    {
      id: "customers",
      label: "Total Customers",
      value: adminStats.totalCustomer ?? 0,
      icon: Briefcase,
    },
    {
      id: "projects",
      label: "Active Projects",
      value: adminStats.activeProject ?? 0,
      icon: Folder,
    },
    {
      id: "tickets",
      label: "Open Tickets",
      value: adminStats.openTicket ?? 0,
      icon: Ticket,
    },
  ];

  return (
    <PageWrapper>
      {/* Top: stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        {statCards.map(({ id, ...stat }) => (
          <StatCard key={id} {...stat} />
        ))}
      </div>

      {/* Middle: revenue chart (2/3) + project status (1/3) */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <RevenueExpenseChart
          data={MOCK_REVENUE_DATA}
          className="h-full lg:col-span-2"
        />
        <ProjectStatusChart data={projectStatus} className="h-full" />
      </div>

      {/* Bottom: recent users (2/3) + activity feed (1/3) */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <RecentUsers users={users} className="lg:col-span-2" />

        {/*
          On large screens the feed is absolutely positioned inside this wrapper,
          so the row height is set by Recent Users and the feed scrolls to fit it.
          Below `lg` it flows normally and uses a capped height.
        */}
        <div className="relative">
          <ActivityFeed
            className="h-full lg:absolute lg:inset-0"
            scrollClassName="max-h-80 lg:max-h-none"
          />
        </div>
      </div>
    </PageWrapper>
  );
}