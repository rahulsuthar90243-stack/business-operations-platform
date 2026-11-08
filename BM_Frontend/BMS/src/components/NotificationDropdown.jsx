import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import {
  getNotifications,
  markNotificationsRead,
} from "../services/adminService.js";

function NotificationDropdown({
  onNotificationsClick,
  buttonClassName = "relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const dropdownRef = useRef(null);
  const requestVersion = useRef(0);
  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  useEffect(() => {
    let isCurrent = true;
    const version = requestVersion.current;

    getNotifications()
      .then((result) => {
        if (!Array.isArray(result)) {
          throw new Error("The notifications response was invalid.");
        }
        if (isCurrent && version === requestVersion.current) {
          setNotifications(result);
        }
      })
      .catch((requestError) => {
        if (isCurrent && version === requestVersion.current) {
          setError(requestError.message || "Unable to load notifications.");
        }
      })
      .finally(() => {
        if (isCurrent && version === requestVersion.current) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [refreshKey]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className={buttonClassName}
        aria-label={
          unreadCount > 0
            ? `Notifications (${unreadCount})`
            : "Notifications"
        }
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={async () => {
          if (isOpen) {
            setIsOpen(false);
            return;
          }

          setIsOpen(true);
          onNotificationsClick?.();
          setIsLoading(true);
          setError("");
          const version = ++requestVersion.current;

          try {
            const result = await getNotifications();
            if (!Array.isArray(result)) {
              throw new Error("The notifications response was invalid.");
            }

            if (version !== requestVersion.current) return;
            setNotifications(result);
            const unreadIds = result
              .filter((notification) => !notification.isRead)
              .map((notification) => notification._id);

            if (unreadIds.length > 0) {
              await markNotificationsRead(unreadIds);
              if (version === requestVersion.current) {
                setNotifications((current) =>
                  current.map((notification) =>
                    unreadIds.includes(notification._id)
                      ? { ...notification, isRead: true }
                      : notification
                  )
                );
              }
            }
          } catch (requestError) {
            if (version === requestVersion.current) {
              setError(
                requestError.message || "Unable to update notifications."
              );
            }
          } finally {
            if (version === requestVersion.current) setIsLoading(false);
          }
        }}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Notifications
            </h2>
            <span className="text-xs text-slate-500">
              {unreadCount} unread
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                Loading notifications...
              </p>
            ) : error ? (
              <div className="px-4 py-5 text-center">
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-violet-600 hover:text-violet-700"
                  onClick={() => {
                    setIsLoading(true);
                    setError("");
                    setRefreshKey((key) => key + 1);
                  }}
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                You&apos;re all caught up.
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`flex gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 ${
                    !notification.isRead ? "bg-violet-50/50" : ""
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      !notification.isRead ? "bg-violet-500" : "bg-transparent"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-slate-800">
                      {notification.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-slate-600">
                      {notification.message}
                    </p>
                    <time
                      className="mt-1 block text-xs text-slate-400"
                      dateTime={notification.createdAt}
                    >
                      {new Date(notification.createdAt).toLocaleString()}
                    </time>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-2 text-right">
            <span className="text-xs text-slate-500">Showing latest 10</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
