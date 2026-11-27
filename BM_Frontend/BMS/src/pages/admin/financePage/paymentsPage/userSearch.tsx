import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

export interface SearchableUser {
  _id: string;
  username?: string;
  name?: string;
  email?: string;
  companyName?: string;
}

interface UserSearchProps {
  users: SearchableUser[];
  selectedUserId: string;
  onSelect: (user: SearchableUser) => void;
}

const getUserName = (user: SearchableUser) =>
  user.username || user.name || user.email || "Customer";

export default function UserSearch({
  users,
  selectedUserId,
  onSelect,
}: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    const searchTerm = query.trim().toLocaleLowerCase();
    return users.filter((user) =>
      [getUserName(user), user.email, user.companyName]
        .filter(Boolean)
        .some((value) =>
          String(value).toLocaleLowerCase().includes(searchTerm),
        ),
    );
  }, [query, users]);
  const selectedUser = users.find((user) => user._id === selectedUserId);

  const selectUser = (user: SearchableUser) => {
    onSelect(user);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div>
      <label className="text-sm font-medium text-slate-700">Customer *</label>
      <div className="relative mt-1.5">
        <button
          type="button"
          role="combobox"
          aria-label="Customer"
          aria-required="true"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls="payment-customer-options"
          onClick={() => setIsOpen((open) => !open)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-left text-sm text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        >
          <span
            className={
              selectedUserId ? "truncate" : "truncate text-slate-400"
            }
          >
            {selectedUser ? getUserName(selectedUser) : "Select a customer"}
          </span>
          <ChevronDown
            aria-hidden="true"
            className="ml-2 size-4 shrink-0 text-slate-400"
          />
        </button>
        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
            <label className="relative block border-b border-slate-100 p-2">
              <Search
                aria-hidden="true"
                className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                autoFocus
                role="searchbox"
                aria-label="Search customers"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsOpen(false);
                    setQuery("");
                  } else if (event.key === "Enter" && filteredUsers[0]) {
                    event.preventDefault();
                    selectUser(filteredUsers[0]);
                  }
                }}
                placeholder="Search by name or email…"
                className="h-9 w-full rounded border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-violet-400"
              />
            </label>
            <div
              id="payment-customer-options"
              role="listbox"
              aria-label="Customers"
              className="max-h-56 overflow-y-auto py-1"
            >
              {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  role="option"
                  aria-selected={user._id === selectedUserId}
                  onClick={() => selectUser(user)}
                  className="block w-full px-3 py-2.5 text-left hover:bg-violet-50 aria-selected:bg-violet-50"
                >
                  <span className="block truncate text-sm font-medium text-slate-700">
                    {getUserName(user)}
                  </span>
                  {user.email && (
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {user.email}
                    </span>
                  )}
                </button>
              ))}
              {filteredUsers.length === 0 && (
                <p className="px-3 py-3 text-sm text-slate-500">
                  {users.length === 0
                    ? "No customers available."
                    : "No matching customers."}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}