import { Outlet } from 'react-router-dom';
import Header from '../components/Header'
import Sidebar from '../components/Sidebar';



export default function DashboardLayout({
	headerProps = {},
	sidebarProps = {},
}) {
	return (
		<div className="flex h-dvh overflow-hidden bg-slate-100">
			<Sidebar {...sidebarProps} />
			<div className="flex min-w-0 flex-1 flex-col">
				<Header title={headerProps.title ?? 'Dashboard'} {...headerProps} />
				<main className="min-h-0 flex-1 overflow-y-auto" aria-label="Page content">
					<div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	)
}
