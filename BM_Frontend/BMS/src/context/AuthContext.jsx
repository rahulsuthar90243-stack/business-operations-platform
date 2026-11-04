import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const API_URL = "http://localhost:4000";

const AuthContext = createContext(null);

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message || data.error || response.statusText || "Request failed."
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

function normalizeUser(data) {
  const userData = data?.user ?? data;
  const role = userData?.role ?? userData?.userRole;

  if (!userData || typeof role !== "string" || !role.trim()) {
    throw new Error("The server response did not include a user role.");
  }

  return {
    id: userData.id ?? userData._id ?? null,
    username: userData.username ?? userData.name ?? "",
    email: userData.email ?? "",
    role: role.trim().toLowerCase(),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const authVersion = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const requestVersion = authVersion.current;

    async function loadProfile() {
      try {
        const data = await request("/api/profile", { signal: controller.signal });
        if (authVersion.current !== requestVersion) return;
        setUser(normalizeUser(data));
      } catch (error) {
        if (error.name === "AbortError") return;
        if (authVersion.current !== requestVersion) return;
        if (error.status !== 401) {
          setAuthError(error.message || "Unable to load your account.");
        }
        setUser(null);
      } finally {
        if (
          !controller.signal.aborted &&
          authVersion.current === requestVersion
        ) {
          setLoading(false);
        }
      }
    }

    loadProfile();
    return () => controller.abort();
  }, []);

  const login = useCallback(async ({ email, password }, options = {}) => {
    const data = await request("/api/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), password }),
      signal: options.signal,
    });
    const authenticatedUser = normalizeUser(data);
    authVersion.current += 1;
    setUser(authenticatedUser);
    setAuthError("");
    setLoading(false);
    return authenticatedUser;
  }, []);

  const registerCompany = useCallback(async (companyDetails) => {
    const data = await request("/api/company", {
      method: "POST",
      body: JSON.stringify(companyDetails),
    });
    const authenticatedUser = normalizeUser(data);
    authVersion.current += 1;
    setUser(authenticatedUser);
    setAuthError("");
    setLoading(false);
    return data;
  }, []);

  const register = useCallback(async ({ username, email, password }) => {
    return request("/api/register", {
      method: "POST",
      body: JSON.stringify({ username, email: email.trim(), password }),
    });
  }, []);

  const logout = useCallback(async () => {
    await request("/api/logout", { method: "POST" });
    authVersion.current += 1;
    setUser(null);
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(user),
      loading,
      authError,
      login,
      registerCompany,
      register,
      logout,
    }),
    [user, loading, authError, login, registerCompany, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Context consumers are hooks, not components, so Fast Refresh cannot accept this export.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}