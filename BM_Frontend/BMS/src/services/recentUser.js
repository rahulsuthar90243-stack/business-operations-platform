export function mapRecentUsers(users) {
  if (!Array.isArray(users)) {
    return [];
  }

  return users.slice(0, 5).map((user) => ({
    id: user._id ?? user.id ?? user.email,
    name: user.username ?? user.name ?? "",
    email: user.email ?? "",
    role: user.role ?? "",
    status: user.isOnline ? "active" : "inactive",
    joined: user.createdAt ? new Date(user.createdAt) : "",
  }));
}
