import React, { Suspense } from "react";
import { createBrowserRouter, RouterProvider, redirect } from "react-router-dom";

// API
import { UserAPI } from "./api/UserApi"

// Layouts
import RootLayout from "./components/layout/RootLayout";
import AuthLayout from "./components/layout/AuthLayout";
import DashboardLayout from "./components/layout/DashboardLayout";
import AdminLayout from "./components/layout/AdminLayout";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import ErrorPage from "./pages/ErrorPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import AcceptInvite from "./pages/AcceptInvite";
import DatastoreDashboard from "./pages/DatastoreDashboard";
import DatasetDashboard from "./pages/DatasetDashboard";
import ProjectDashboard from "./pages/ProjectDashboard";

// ─────────────────────────────────────────
// Auth middleware helpers (utils/auth.ts)
// ─────────────────────────────────────────
const requireUser: MiddlewareFn = async () => {
  const res = await UserAPI.getUserSession();
  if (!res.success) {
    return redirect("/login");
  }

  const data = await res.data.json();
  if (!data.user) {
    return redirect("/login");
  }

  return { user: data.user }
};

function getToken(): string | null {
  return sessionStorage.getItem("accessToken");
}

function decodeToken(token: string): { role: string } | null {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function isAuthenticated(): boolean {
  return !!getToken();
}

function isAdmin(): boolean {
  const token = getToken();
  const payload = token ? decodeToken(token) : null;
  return payload?.role === "admin";
}

// ─────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────
type MiddlewareFn = (args: any) => Promise<Response | void | any> | Response | void | any;

const requireAuth: MiddlewareFn = async () => {
  if (!isAuthenticated()) return redirect("/login");
};

const requireAdmin: MiddlewareFn = async () => {
  if (!isAuthenticated() || !isAdmin()) return redirect("/dashboard");
};

function withMiddlewareLoader(
  middlewares: MiddlewareFn[],
  baseLoader: (args: any) => Promise<any> = async () => null
) {
  return async (args: any) => {
    for (const fn of middlewares) {
      const result = await fn(args);
      if (result instanceof Response) return result;
    }
    return baseLoader(args);
  };
}

// ─────────────────────────────────────────
// Router
// ─────────────────────────────────────────
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    id: "root",

    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        loader: async () => {
          if (isAuthenticated()) {
            return redirect("/dashboard");
          }
          return redirect("/login");
        },
      },
      {
        element: <AuthLayout />,
        id: "auth",
        loader: async () => ({ guest: !isAuthenticated() }),
        errorElement: <ErrorPage />,
        children: [
          {
            path: "login",
            id: "login",
            index: true,
            element: <LoginPage />,
            loader: async () => null,
            action: async () => null,
            errorElement: <ErrorPage />,
          },
          {
            path: "register",
            id: "register",
            index: true,
            element: <RegisterPage />,
            loader: async () => null,
            action: async () => null,
            errorElement: <ErrorPage />,
          },
          {
            path: "verify-email",
            id: "verify-email",
            index: true,
            element: <VerifyEmailPage />,
            loader: async () => null,
            action: async () => null,
            errorElement: <ErrorPage />,
          },
          {
            path: "accept-invite",
            id: "accept-invite",
            index: true,
            element: <AcceptInvite />,
            loader: async () => null,
            action: async () => null,
            errorElement: <ErrorPage />,
          }
        ],
      },
      {
        path: "dashboard",
        element: <DashboardLayout />,
        id: "dashboard-layout",
        loader: withMiddlewareLoader([requireUser]),
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            id: "dashboard",
            element: <DashboardPage />,
            loader: async () => {
              const token = getToken();
              const user = token ? decodeToken(token) : null;
              return { user };
            },
            action: async () => null,
            errorElement: <ErrorPage />,
          },
          {
            path: "dataset",
            id: "dataset",
            element: <DatasetDashboard />,
            loader: async () => {
              const token = getToken();
              const user = token ? decodeToken(token) : null;
              return { user };
            },
            action: async () => null,
            errorElement: <ErrorPage />,
          },
          {
            path: "datastore",
            id: "datastore",
            element: <DatastoreDashboard />,
            loader: async () => {
              const token = getToken();
              const user = token ? decodeToken(token) : null;
              return { user };
            },
            action: async () => null,
            errorElement: <ErrorPage />,
          },
          {
            path: "project",
            id: "project",
            element: <ProjectDashboard />,
            loader: async () => {
              const token = getToken();
              const user = token ? decodeToken(token) : null;
              return { user };
            },
            action: async () => null,
            errorElement: <ErrorPage />,
          },
        ],
      },
      {
        path: "admin/dashboard",
        element: <AdminLayout />,
        id: "admin-layout",
        loader: withMiddlewareLoader([requireAuth, requireAdmin]),
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            id: "admin-dashboard",
            element: <AdminDashboardPage />,
            loader: async () => {
              const token = getToken();
              const user = token ? decodeToken(token) : null;
              return { user };
            },
            action: async () => null,
            errorElement: <ErrorPage />,
          },
        ],
      },
    ],
  },
  {
    path: "/error",
    id: "not-found",
    element: <NotFoundPage />,
  },
]);

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
