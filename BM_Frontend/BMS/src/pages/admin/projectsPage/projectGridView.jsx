export default function ProjectGridView({
  projects,
  getPersonName,
  renderStatus,
  formatDate,
  onSelectProject,
}) {
  return (
    <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <article
          key={project._id}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-800">{project.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {project.companyId?.companyName || "—"}
              </p>
            </div>
            {renderStatus(project)}
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">Manager</dt>
              <dd className="mt-1 font-medium text-slate-700">
                {getPersonName(project.manager)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Deadline</dt>
              <dd className="mt-1 font-medium text-slate-700">
                {formatDate(project.dueDate)}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => onSelectProject(project)}
            className="mt-4 text-sm font-medium text-violet-700 hover:text-violet-900"
          >
            View details
          </button>
        </article>
      ))}
    </div>
  );
}