"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (payload: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function readJson<T>(response: Response) {
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }
  return payload;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const payload = (await response.json()) as {
        authenticated: boolean;
        user?: AuthUser;
      };
      setUser(payload.authenticated && payload.user ? payload.user : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) => response.json())
      .then((payload: { authenticated: boolean; user?: AuthUser }) => {
        if (cancelled) return;
        setUser(payload.authenticated && payload.user ? payload.user : null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const payload = await readJson<{ user: AuthUser }>(
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }),
    );
    setUser(payload.user);
    return payload.user;
  }, []);

  const signup = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      role: string;
    }) => {
      const responsePayload = await readJson<{ user: AuthUser }>(
        await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
      );
      setUser(responsePayload.user);
      return responsePayload.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, refreshSession }),
    [user, loading, login, signup, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
