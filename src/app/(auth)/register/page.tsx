"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Callout } from "@/components/ui/callout";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (companyName.trim().length < 2) {
      setError("Company or studio name is required.");
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        companyName: companyName.trim(),
        companyWebsite: companyWebsite.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
      } as Parameters<typeof authClient.signUp.email>[0] & {
        companyName: string;
        companyWebsite?: string;
        jobTitle?: string;
      });

      if (result.error) {
        setError(result.error.message ?? "Could not complete registration.");
        setLoading(false);
        return;
      }

      router.push("/account");
      router.refresh();
    } catch {
      setError("Network error while submitting registration.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
      <div className="border border-stone-200 bg-white p-8">
        <p className="font-mono text-xs font-semibold tracking-widest text-stone-500 uppercase">
          B2B Trade Application
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
          Request a Trade Account
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-stone-600">
          New trade accounts receive <strong>MEMBER</strong> access with{" "}
          <strong>PENDING</strong> verification status. Once approved by an
          administrator, full moodboard creation and specification management
          are unlocked.
        </p>

        {error && (
          <Callout variant="error" className="mt-5">
            {error}
          </Callout>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="reg-name"
                className="block text-xs font-semibold tracking-wider text-stone-800 uppercase"
              >
                Full Name *
              </label>
              <input
                id="reg-name"
                type="text"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Clara Lindholm"
                className="mt-1.5 w-full border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900"
              />
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-semibold tracking-wider text-stone-800 uppercase"
              >
                Business Email *
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="clara@lindholm-arch.com"
                className="mt-1.5 w-full border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="reg-password"
              className="block text-xs font-semibold tracking-wider text-stone-800 uppercase"
            >
              Password (minimum 8 characters) *
            </label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="mt-1.5 w-full border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="reg-company"
                className="block text-xs font-semibold tracking-wider text-stone-800 uppercase"
              >
                Company / Studio Name *
              </label>
              <input
                id="reg-company"
                type="text"
                required
                minLength={2}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Lindholm & Partners Architects"
                className="mt-1.5 w-full border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900"
              />
            </div>

            <div>
              <label
                htmlFor="reg-role"
                className="block text-xs font-semibold tracking-wider text-stone-800 uppercase"
              >
                Professional Role (Optional)
              </label>
              <input
                id="reg-role"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Senior Specification Architect"
                className="mt-1.5 w-full border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="reg-website"
              className="block text-xs font-semibold tracking-wider text-stone-800 uppercase"
            >
              Company Website (Optional)
            </label>
            <input
              id="reg-website"
              type="url"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              placeholder="https://lindholm-arch.com"
              className="mt-1.5 w-full border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-stone-900 bg-stone-900 px-5 py-3 text-xs font-semibold tracking-widest text-white uppercase hover:bg-stone-800 disabled:opacity-50"
          >
            {loading ? "Submitting Application..." : "Submit Trade Application"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-stone-600">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-semibold text-stone-900 underline underline-offset-4"
          >
            Sign in to your account
          </Link>
        </p>
      </div>
    </div>
  );
}
