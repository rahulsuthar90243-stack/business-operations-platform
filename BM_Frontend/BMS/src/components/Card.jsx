/**
 * Card
 * Reusable surface for dashboard sections (charts, tables, activity feed, etc.).
 *
 * Usage:
 *   <Card title="Revenue vs Expenses" description="January – September 2026">
 *     <RevenueChart />
 *   </Card>
 *
 *   <Card className="h-full">...</Card>
 */
export default function Card({ title, description, children, className = "" }) {
  const hasHeader = title || description;

  return (
    <section
      className={`min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6 ${className}`}
    >
      {hasHeader && (
        <header className={children ? "mb-4 sm:mb-5" : ""}>
          {title && (
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              {description}
            </p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}