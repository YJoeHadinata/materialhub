import Link from "next/link";
import { BrandLogo } from "./brand-logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-stone-800 bg-stone-950 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <BrandLogo size="md" inverted={true} />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-400">
              B2B architectural surface library and specification workspace.
              Engineered for architects, interior designers, and property
              developers evaluating natural stone, sintered ceramics, certified
              timber, architectural metals, and structural glass.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-semibold tracking-wider text-white uppercase">
              Material Library
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-stone-400">
              <li>
                <Link
                  href="/catalogue?material=natural-stone"
                  className="transition-colors hover:text-white"
                >
                  Natural Stone
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogue?material=ceramic"
                  className="transition-colors hover:text-white"
                >
                  Sintered Ceramic & Terracotta
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogue?material=timber"
                  className="transition-colors hover:text-white"
                >
                  Architectural Timber
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogue?material=metal-panels"
                  className="transition-colors hover:text-white"
                >
                  Anodized & Patinated Metals
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogue?material=glass"
                  className="transition-colors hover:text-white"
                >
                  Structural & Reeded Glass
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold tracking-wider text-white uppercase">
              Trade Specification
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-stone-400">
              <li>
                <Link
                  href="/catalogue"
                  className="transition-colors hover:text-white"
                >
                  Full Technical Catalogue
                </Link>
              </li>
              <li>
                <Link
                  href="/moodboards"
                  className="transition-colors hover:text-white"
                >
                  Project Moodboards
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="transition-colors hover:text-white"
                >
                  Apply for Trade Account
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="transition-colors hover:text-white"
                >
                  Trade Member Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-stone-800/80 pt-8 text-xs text-stone-400 sm:flex-row sm:items-center">
          <p>
            MaterialHub Architectural Specification Platform. Personal Portfolio
            Project by Yoshua Joe.
          </p>
          <p>
            Non-commercial evaluation and demonstration use only.
          </p>
        </div>
      </div>
    </footer>
  );
}
