"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthenticatedUser } from "@/types";
import { Callout } from "@/components/ui/callout";
import { StudioToast } from "@/components/ui/studio-toast";

export function ProfileEditor({ user }: { user: AuthenticatedUser }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [companyName, setCompanyName] = useState(user.companyName);
  const [companyWebsite, setCompanyWebsite] = useState(
    user.companyWebsite ?? "",
  );
  const [jobTitle, setJobTitle] = useState(user.jobTitle ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/v1/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          companyName: companyName.trim(),
          companyWebsite: companyWebsite.trim() || undefined,
          jobTitle: jobTitle.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "Failed to update profile.");
      } else {
        setSaved(true);
        router.refresh();
      }
    } catch {
      setError("Network error while updating profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="border border-stone-200 bg-white p-6 space-y-5"
    >
      <div className="border-b border-stone-200 pb-4">
        <h2 className="text-sm font-semibold tracking-wider text-stone-900 uppercase">
          Practice & Contact Profile
        </h2>
        <p className="mt-1 text-xs text-stone-600">
          Update your studio information and professional specification role.
        </p>
      </div>

      {error && <Callout variant="error">{error}</Callout>}

      <StudioToast
        message={saved ? "Profile information updated." : null}
        onDismiss={() => setSaved(false)}
        tag="Saved"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="prof-name"
            className="block text-xs font-semibold tracking-wider text-stone-700 uppercase"
          >
            Full Name
          </label>
          <input
            id="prof-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm text-stone-900"
          />
        </div>

        <div>
          <label
            htmlFor="prof-email"
            className="block text-xs font-semibold tracking-wider text-stone-700 uppercase"
          >
            Registered Email (Read-only)
          </label>
          <input
            id="prof-email"
            type="email"
            disabled
            value={user.email}
            className="mt-1 w-full border border-stone-200 bg-stone-100 px-3 py-2 text-sm text-stone-500"
          />
        </div>

        <div>
          <label
            htmlFor="prof-company"
            className="block text-xs font-semibold tracking-wider text-stone-700 uppercase"
          >
            Company / Practice Name
          </label>
          <input
            id="prof-company"
            type="text"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm text-stone-900"
          />
        </div>

        <div>
          <label
            htmlFor="prof-role"
            className="block text-xs font-semibold tracking-wider text-stone-700 uppercase"
          >
            Professional Role
          </label>
          <input
            id="prof-role"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Senior Specification Architect"
            className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm text-stone-900"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="prof-website"
            className="block text-xs font-semibold tracking-wider text-stone-700 uppercase"
          >
            Company Website
          </label>
          <input
            id="prof-website"
            type="url"
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            placeholder="https://studio.arch"
            className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm text-stone-900"
          />
        </div>
      </div>

      <div className="flex justify-end border-t border-stone-100 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="border border-stone-900 bg-stone-900 px-5 py-2.5 text-xs font-semibold tracking-wider text-white uppercase hover:bg-stone-800 disabled:opacity-50"
        >
          {saving ? "Saving Changes..." : "Save Profile Changes"}
        </button>
      </div>
    </form>
  );
}
