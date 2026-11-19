import { MoreHorizontal } from "lucide-react";

export default function ProjectTableView({
  projects,
  getPersonName,
  renderStatus,
  formatDate,
  onSelectProject,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-white text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            <th scope="col" className="px-5 py-4">Project</th>
            <th scope="col" className="px-5 py-4">Manager</th>
            <th scope="col" className="px-5 py-4">Created By</th>
            <th scope="col" className="px-5 py-4">Team Members</th>
            <th scope="col" className="px-5 py-4">Status</th>
            <th scope="col" className="px-5 py-4">Start Date</th>
            <th scope="col" className="px-5 py-4">Deadline</th>
            <th scope="col" className="px-5 py-4">Created</th>
            <th scope="col" className="px-5 py-4 text-right">&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, index) => (
            <tr
              key={project._id || `${project.name}-${index}`}
              className="align-middle"
            >
              <td className="border-t border-slate-200 px-5 py-5 text-sm">
                <div className="font-medium text-slate-800">{project.name}</div>
                {project.description && (
                  <div className="mt-1 max-w-xs text-xs text-slate-500">
                    {project.description}
                  </div>
                )}
                <div className="mt-1 text-[11px] text-slate-400">
                  {project._id || "—"}
                </div>
              </td>
              <td className="border-t border-slate-200 px-5 py-5 text-sm text-slate-700">
                {getPersonName(project.manager)}
              </td>
              <td className="border-t border-slate-200 px-5 py-5 text-sm text-slate-700">
                {getPersonName(project.createdBy)}
              </td>
              <td className="border-t border-slate-200 px-5 py-5 text-sm text-slate-700">
                {project.members?.length
                  ? project.members.map(getPersonName).join(", ")
                  : "No members"}
              </td>
              <td className="border-t border-slate-200 px-5 py-5 text-sm">
                {renderStatus(project)}
              </td>
              <td className="border-t border-slate-200 px-5 py-5 text-sm text-slate-700">
                {formatDate(project.startDate)}
              </td>
              <td className="border-t border-slate-200 px-5 py-5 text-sm text-slate-700">
                {formatDate(project.dueDate)}
              </td>
              <td className="border-t border-slate-200 px-5 py-5 text-sm text-slate-700">
                {formatDate(project.createdAt)}
              </td>
              <td className="border-t border-slate-200 px-5 py-5 text-right">
                <button
                  type="button"
                  onClick={() => onSelectProject(project)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  aria-label={`View details for ${project.name}`}
                >
                  <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}