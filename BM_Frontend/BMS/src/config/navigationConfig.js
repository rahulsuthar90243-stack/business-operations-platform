
//  * Centralized, role-based navigation configuration for BMP
 
import {
  House,
  LayoutDashboard,
  UsersRound,
  Folder,
  Briefcase,
  Ticket,
  BarChart3,
  Settings,
  ClipboardList,
  ClipboardCheck,
  CalendarDays,
  Clock,
  Calendar,
  MessageSquareMore,
  FileText,
  Files,
} from 'lucide-react';


export const ROLES = Object.freeze({
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  CUSTOMER: 'customer',
});


const PATHS = Object.freeze({
  admin: {
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    projects: '/admin/projects',
    customers: '/admin/customers',
    tickets: '/admin/tickets',
    analytics: '/admin/analytics',
    settings: '/admin/settings',
    auditLogs: '/admin/audit-logs',
  },
  manager: {
    dashboard: '/manager/dashboard',
    projects: '/manager/projects',
    teamMembers: '/manager/team-members',
    tasks: '/manager/tasks',
    tickets: '/manager/tickets',
    reports: '/manager/reports',
    calendar: '/manager/calendar',
    messages: '/manager/messages',
    settings: '/manager/settings',
  },
  employee: {
    dashboard: '/employee/dashboard',
    tasks: '/employee/tasks',
    projects: '/employee/projects',
    tickets: '/employee/tickets',
    timeTracking: '/employee/time-tracking',
    schedule: '/employee/schedule',
    calendar: '/employee/calendar',
    messages: '/employee/messages',
    profile: '/employee/profile',
    settings: '/employee/settings',
  },
  customer: {
    dashboard: '/customer/dashboard',
    projects: '/customer/projects',
    tickets: '/customer/tickets',
    messages: '/customer/messages',
    orders: '/customer/orders',
    invoices: '/customer/invoices',
    payments: '/customer/payments',
    documents: '/customer/documents',
    support: '/customer/support',
    profile: '/customer/profile',
    settings: '/customer/settings',
  },
});


const NAVIGATION_BY_ROLE = {
  [ROLES.ADMIN]: [
    { id: 'admin-dashboard', label: 'Dashboard', path: PATHS.admin.dashboard, icon: House },
    { id: 'admin-users', label: 'User Management', path: PATHS.admin.users, icon: UsersRound },
    { id: 'admin-projects', label: 'Projects', path: PATHS.admin.projects, icon: Folder },
    { id: 'admin-customers', label: 'Customers', path: PATHS.admin.customers, icon: Briefcase },
    { id: 'admin-tickets', label: 'Tickets', path: PATHS.admin.tickets, icon: Ticket },
    { id: 'admin-analytics', label: 'Analytics', path: PATHS.admin.analytics, icon: BarChart3 },
    { id: 'admin-settings', label: 'Settings', path: PATHS.admin.settings, icon: Settings },
    { id: 'admin-audit-logs', label: 'Audit Logs', path: PATHS.admin.auditLogs, icon: ClipboardList },
  ],

  [ROLES.MANAGER]: [
    { id: 'manager-dashboard', label: 'Dashboard', path: PATHS.manager.dashboard, icon: House },
    { id: 'manager-projects', label: 'My Projects', path: PATHS.manager.projects, icon: Folder },
    { id: 'manager-team-members', label: 'Team Members', path: PATHS.manager.teamMembers, icon: UsersRound },
    { id: 'manager-tasks', label: 'Tasks', path: PATHS.manager.tasks, icon: ClipboardCheck },
    { id: 'manager-tickets', label: 'Tickets', path: PATHS.manager.tickets, icon: Ticket },
    { id: 'manager-reports', label: 'Reports', path: PATHS.manager.reports, icon: BarChart3 },
    { id: 'manager-calendar', label: 'Calendar', path: PATHS.manager.calendar, icon: CalendarDays },
    { id: 'manager-messages', label: 'Messages', path: PATHS.manager.messages, icon: MessageSquareMore },
    { id: 'manager-settings', label: 'Settings', path: PATHS.manager.settings, icon: Settings },
  ],

  [ROLES.EMPLOYEE]: [
  { id: 'employee-dashboard', label: 'Dashboard', path: PATHS.employee.dashboard, icon: LayoutDashboard },
  { id: 'employee-tasks', label: 'My Tasks', path: PATHS.employee.tasks, icon: ClipboardCheck },
  { id: 'employee-projects', label: 'My Projects', path: PATHS.employee.projects, icon: Folder },
  { id: 'employee-tickets', label: 'Tickets', path: PATHS.employee.tickets, icon: Ticket },
  { id: 'employee-time-tracking', label: 'Time Tracking', path: PATHS.employee.timeTracking, icon: Clock },
  { id: 'employee-calendar', label: 'Calendar', path: PATHS.employee.calendar, icon: Calendar },
  { id: 'employee-messages', label: 'Messages', path: PATHS.employee.messages, icon: MessageSquareMore },
  { id: 'employee-settings', label: 'Settings', path: PATHS.employee.settings, icon: Settings },
  ],

  [ROLES.CUSTOMER]: [
  { id: 'customer-dashboard', label: 'Dashboard', path: PATHS.customer.dashboard, icon: LayoutDashboard },
  { id: 'customer-projects', label: 'My Projects', path: PATHS.customer.projects, icon: Folder },
  { id: 'customer-tickets', label: 'Support Tickets', path: PATHS.customer.tickets, icon: Ticket },
  { id: 'customer-messages', label: 'Messages', path: PATHS.customer.messages, icon: MessageSquareMore },
  { id: 'customer-invoices', label: 'Invoices', path: PATHS.customer.invoices, icon: FileText },
  { id: 'customer-documents', label: 'Documents', path: PATHS.customer.documents, icon: Files },
  { id: 'customer-settings', label: 'Settings', path: PATHS.customer.settings, icon: Settings },
  ],
};


const normalizeRole = (role) =>
  typeof role === 'string' ? role.trim().toLowerCase() : '';

/**
 * Returns the sidebar navigation items for a role.
 * Unknown / missing roles return an empty array (least privilege).
 * Returns a new array so consumers cannot mutate the shared config.
 *
 * @param {string} role
 * @returns {Array<{id: string, label: string, path: string, icon: import('react').ComponentType}>}
 */
export const getNavigationByRole = (role) => {
  const items = NAVIGATION_BY_ROLE[normalizeRole(role)];
  return items ? items.map((item) => ({ ...item })) : [];
};


//  * Returns the landing (dashboard) path for a role, or null if unknown.
//  * Useful for post-login redirects and "access denied" fallbacks.

export const getDefaultRouteByRole = (role) =>
  NAVIGATION_BY_ROLE[normalizeRole(role)]?.[0]?.path ?? null;

export const isPathInNavigation = (role, pathname) =>
  getNavigationByRole(role).some(
    ({ path }) => pathname === path || pathname.startsWith(`${path}/`)
  );