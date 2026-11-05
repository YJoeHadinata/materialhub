"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, ShieldCheck, User, X } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import type { AuthenticatedUser } from "@/types";
import { BrandLogo } from "./brand-logo";

export function SiteHeader({
  currentUser,
}: {
  currentUser: AuthenticatedUser | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  const navLinks = [
    { href: "/catalogue", label: "Catalogue", exact: true },
    { href: "/catalogue?material=natural-stone", label: "Natural Stone" },
    { href: "/catalogue?material=ceramic", label: "Ceramic" },
    { href: "/catalogue?material=timber", label: "Timber" },
    { href: "/catalogue?material=metal-panels", label: "Metals" },
    { href: "/catalogue?material=glass", label: "Glass" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/90 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex shrink-0 items-center transition-opacity hover:opacity-85"
            aria-label="MaterialHub Homepage"
          >
            <BrandLogo size="md" />
          </Link>

          <nav
            aria-label="Primary Navigation"
            className="hidden items-center gap-5 xl:flex"
          >
            {navLinks.map((item) => {
              const isActive = item.exact
                ? pathname === "/catalogue"
                : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap py-1 text-[13px] transition-colors duration-150 ${
                    isActive
                      ? "font-semibold text-stone-950"
                      : "font-medium text-stone-600 hover:text-stone-950"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-2.5 md:flex">
          {currentUser ? (
            <>
              {currentUser.role === "ADMIN" && (
                <Link
                  href="/admin/dashboard"
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border border-stone-900 bg-stone-900 px-3 py-1.5 text-xs font-medium text-white transition-colors duration-150 hover:bg-stone-800"
                >
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Admin Console</span>
                </Link>
              )}

              <Link
                href="/moodboards"
                className="shrink-0 whitespace-nowrap border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 transition-colors duration-150 hover:border-stone-900 hover:text-stone-950"
              >
                Moodboards
              </Link>

              <Link
                href="/account"
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 py-1.5 text-xs font-medium text-stone-700 transition-colors duration-150 hover:text-stone-950"
              >
                <User className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
                <span>{currentUser.name}</span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 transition-colors duration-150 hover:border-stone-900 hover:text-stone-950 disabled:opacity-50"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{signingOut ? "Signing Out..." : "Sign Out"}</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="shrink-0 whitespace-nowrap px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors duration-150 hover:text-stone-950"
              >
                Trade Sign In
              </Link>
              <Link
                href="/register"
                className="shrink-0 whitespace-nowrap border border-stone-900 bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white transition-colors duration-150 hover:bg-stone-800"
              >
                Request Trade Account
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
          className="inline-flex items-center justify-center rounded-md border border-stone-300 p-2 text-stone-800 xl:hidden"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-stone-200 bg-white px-4 pt-3 pb-6 xl:hidden">
          <nav className="flex flex-col space-y-1.5" aria-label="Mobile Navigation">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-2 border-t border-stone-200 pt-4 md:hidden">
            {currentUser ? (
              <>
                {currentUser.role === "ADMIN" && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md border border-stone-900 bg-stone-900 px-4 py-2.5 text-center text-xs font-medium text-white"
                  >
                    Admin Console
                  </Link>
                )}
                <Link
                  href="/moodboards"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md border border-stone-300 bg-white px-4 py-2.5 text-center text-xs font-medium text-stone-900"
                >
                  Moodboards
                </Link>
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md border border-stone-300 bg-white px-4 py-2.5 text-center text-xs font-medium text-stone-900"
                >
                  Trade Profile ({currentUser.name})
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-md border border-stone-300 px-4 py-2.5 text-xs font-medium text-stone-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md border border-stone-300 bg-white px-4 py-2.5 text-center text-xs font-medium text-stone-900"
                >
                  Trade Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md border border-stone-900 bg-stone-900 px-4 py-2.5 text-center text-xs font-medium text-white"
                >
                  Request Trade Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
