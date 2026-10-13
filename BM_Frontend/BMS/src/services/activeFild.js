export function getActiveUsers(users) {
  if (!Array.isArray(users)) {
    return [];
  }

  return users.slice(0, 5).map((user) => ({
    user: user.user?.username ?? user.username ?? user.name ?? "",
    action: user.action ?? "",
    entityType: user.entityType ?? "",
    description: user.description ?? "",
    createdAt: user.createdAt ?? "",
    id: user._id ?? user.id,
  }));
}


export default getActiveUsers;