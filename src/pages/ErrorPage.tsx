// ErrorPage.tsx
import { useRouteError, isRouteErrorResponse } from "react-router-dom";

export default function ErrorPage() {
  const err = useRouteError();

  // Always log in dev
  console.error("Route error:", err);

  if (isRouteErrorResponse(err)) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Route Error</h2>
        <div>Status: {err.status}</div>
        <div>StatusText: {err.statusText}</div>
        <pre>{JSON.stringify(err.data, null, 2)}</pre>
      </div>
    );
  }

  const e = err as any;
  return (
    <div style={{ padding: 16 }}>
      <h2>Unexpected Error</h2>
      <div>{e?.message ?? String(err)}</div>
      <pre>{e?.stack}</pre>
    </div>
  );
}
