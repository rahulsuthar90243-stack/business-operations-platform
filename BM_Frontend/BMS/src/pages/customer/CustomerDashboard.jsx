import {
  ArrowRight,
  FileText,
  Folder,
  MessageSquareMore,
  Ticket,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageWrapper from '../../components/PageWrapper.jsx';

const QUICK_LINKS = [
  { label: 'My Projects', description: 'Review your projects', path: '/customer/projects', icon: Folder },
  { label: 'Support Tickets', description: 'Get help from our team', path: '/customer/tickets', icon: Ticket },
  { label: 'Messages', description: 'View your conversations', path: '/customer/messages', icon: MessageSquareMore },
  { label: 'Invoices', description: 'Review billing documents', path: '/customer/invoices', icon: FileText },
];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const name = user?.username?.trim() || 'there';

  return (
    <PageWrapper>
      <section className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-violet-700">Customer portal</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Welcome back, {name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Manage your projects, support requests, messages, and billing from one place.
        </p>
        {user?.email && (
          <p className="mt-4 text-sm text-slate-500">
            Signed in as <span className="font-medium text-slate-700">{user.email}</span>
          </p>
        )}
      </section>

      <section aria-labelledby="customer-quick-links">
        <h2 id="customer-quick-links" className="mb-4 text-lg font-semibold text-slate-900">
          Quick links
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {QUICK_LINKS.map(({ label, description, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-violet-700"
                />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{label}</h3>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            </Link>
          ))}
        </div>
      </section>
    </PageWrapper>
  );
}
