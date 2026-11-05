import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FileSpreadsheet,
  LayoutDashboard,
  Package,
  Tags,
  Users,
} from "lucide-react";
import { getCurrentUser } from "@/server/authorization";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  const adminNav = [
    {
      href: "/admin/dashboard",
      label: "Dashboard & Audit Log",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/products",
      label: "Product Catalogue CRUD",
      icon: Package,
    },
    {
      href: "/admin/categories",
      label: "Materials, Finishes & Apps",
      icon: Tags,
    },
    {
      href: "/admin/trade-accounts",
      label: "Trade Account Governance",
      icon: Users,
    },
    {
      href: "/admin/imports",
      label: "CSV Bulk Import",
      icon: FileSpreadsheet,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-stone-200 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold tracking-widest text-stone-500 uppercase">
              MaterialHub Governance Console
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
              Platform Administration
            </h1>
          </div>

          <nav
            aria-label="Administration sub-navigation"
            className="flex flex-wrap items-center gap-2"
          >
            {adminNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-1.5 border border-stone-300 bg-white px-3 py-2 text-xs font-medium tracking-wider text-stone-800 uppercase hover:border-stone-900 hover:bg-stone-900 hover:text-white"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {children}
    </div>
  );
}
