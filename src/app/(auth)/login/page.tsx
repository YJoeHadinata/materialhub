"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Callout } from "@/components/ui/callout";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function performSignIn(targetEmail: string, targetPassword: string) {
    setError(null);
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email: targetEmail.trim(),
        password: targetPassword,
      });

      if (result.error) {
        setError(result.error.message ?? "Invalid email or password.");
        setLoading(false);
        return;
      }

      router.push("/account");
      router.refresh();
    } catch {
      setError("Unable to complete sign-in. Please verify your credentials.");
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await performSignIn(email, password);
  }

  async function handleDemoLogin(demoEmail: string, demoPass: string) {
    setEmail(demoEmail);
    setPassword(demoPass);
    await performSignIn(demoEmail, demoPass);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="border border-stone-200 bg-white p-8">
        <p className="text-xs font-semibold tracking-widest text-stone-600 uppercase">
          Trade & Administrator Access
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
          Sign In to MaterialHub
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-stone-600">
          Access your architectural specification workspace, personal
          moodboards, and trade account status.
        </p>

        {error && (
          <Callout variant="error" className="mt-5">
            {error}
          </Callout>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold tracking-wider text-stone-800 uppercase"
            >
              Business Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="architect@studio.arch"
              className="mt-1.5 w-full border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold tracking-wider text-stone-800 uppercase"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-1.5 w-full border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-stone-900 bg-stone-900 px-5 py-3 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-stone-800 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 border-t border-stone-200 pt-6">
          <p className="text-[11px] font-semibold tracking-wider text-stone-600 uppercase">
            Instant Demo Sign-In (Click any role to sign in immediately)
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                handleDemoLogin(
                  "architect@atelier-nord.arch",
                  "TradePassword123!",
                )
              }
              className="border border-stone-300 bg-stone-50 px-2.5 py-2 text-left text-[11px] text-stone-800 transition-colors hover:border-stone-900 hover:bg-white disabled:opacity-50"
            >
              <span className="block font-semibold">Approved Trade</span>
              <span className="block truncate text-stone-600">
                architect@atelier-nord.arch
              </span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                handleDemoLogin(
                  "pending@veritas-build.arch",
                  "TradePassword123!",
                )
              }
              className="border border-stone-300 bg-stone-50 px-2.5 py-2 text-left text-[11px] text-stone-800 transition-colors hover:border-stone-900 hover:bg-white disabled:opacity-50"
            >
              <span className="block font-semibold">Pending Trade</span>
              <span className="block truncate text-stone-600">
                pending@veritas-build.arch
              </span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                handleDemoLogin(
                  "admin@materialhub.arch",
                  "AdminPassword123!",
                )
              }
              className="border border-stone-300 bg-stone-50 px-2.5 py-2 text-left text-[11px] text-stone-800 transition-colors hover:border-stone-900 hover:bg-white disabled:opacity-50"
            >
              <span className="block font-semibold">Administrator</span>
              <span className="block truncate text-stone-600">
                admin@materialhub.arch
              </span>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-stone-600">
          Need a trade specification account?{" "}
          <Link
            href="/register"
            className="font-semibold text-stone-900 underline underline-offset-4"
          >
            Submit a trade application
          </Link>
        </p>
      </div>
    </div>
  );
}
