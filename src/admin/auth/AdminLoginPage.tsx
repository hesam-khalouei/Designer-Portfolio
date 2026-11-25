import { useState, type FormEvent } from "react";
import { useAdminAuth } from "./AdminAuthProvider";

export function AdminLoginPage() {
  const { signIn, error } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setFormError(null);

    try {
      await signIn(email.trim(), password);
    } catch (cause) {
      setFormError("Unable to sign in. Check your credentials and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-login" dir="auto">
      <section className="admin-login__panel" aria-labelledby="admin-login-title">
        <h1 id="admin-login-title">Admin Sign In</h1>
        <p>Sign in to access the administration panel.</p>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="admin-login-email">Email</label>
            <input
              id="admin-login-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="admin-login-password">Password</label>
            <input
              id="admin-login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={submitting}
            />
          </div>

          {(formError || error) && <p role="alert">{formError || error?.message}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
