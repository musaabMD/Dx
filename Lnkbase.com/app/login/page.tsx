import { Lock } from "lucide-react";

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <main className="shell">
      <section className="panel" style={{ maxWidth: 440, margin: "80px auto" }}>
        <span className="agent-icon" style={{ marginBottom: 18 }}>
          <Lock size={22} />
        </span>
        <h1 className="page-title">Sign in</h1>
        <p className="page-subtitle">Single-user password access for your local Linkbase MVP.</p>
        <form action="/api/auth/login" method="post" style={{ marginTop: 22 }}>
          <input type="hidden" name="next" value={searchParams.next || "/dashboard"} />
          <label className="label" htmlFor="password">Password</label>
          <input className="input" id="password" name="password" type="password" autoComplete="current-password" required />
          <button className="button primary" style={{ width: "100%", marginTop: 16 }} type="submit">
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
