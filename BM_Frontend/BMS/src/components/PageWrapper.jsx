


export default function PageWrapper({ children, className = "" }) {
  return (
    <main
      className={`min-h-full w-full min-w-0 flex-1 overflow-x-hidden bg-gray-100 p-4 sm:p-6 lg:p-8 ${className}`}
    >
      <div className="mx-auto flex w-full min-w-0 flex-col gap-4 sm:gap-6">
        {children}
      </div>
    </main>
  );
}