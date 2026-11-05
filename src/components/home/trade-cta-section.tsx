import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export function TradeCtaSection() {
  return (
    <section className="border-t border-stone-200 bg-stone-900 py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="text-xs font-semibold tracking-wider text-stone-300 uppercase">
              Professional Trade Membership
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Specify with confidence across every project phase.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-300">
              Register your architectural practice, interior design studio, or
              property development firm to build private material moodboards,
              sequence specification palettes, and track MOQ requirements.
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-3 text-xs text-stone-300 sm:grid-cols-3">
              <li className="flex items-center gap-2">
                <CheckCircle2
                  className="h-4 w-4 text-stone-300"
                  aria-hidden="true"
                />
                <span>Unlimited Project Moodboards</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2
                  className="h-4 w-4 text-stone-300"
                  aria-hidden="true"
                />
                <span>Full Dimensional & MOQ Data</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2
                  className="h-4 w-4 text-stone-300"
                  aria-hidden="true"
                />
                <span>Dedicated Trade Verification</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col">
            <Link
              href="/register"
              className="border border-white bg-white px-5 py-3.5 text-center text-xs font-semibold tracking-wider text-stone-950 uppercase transition-colors hover:bg-stone-100"
            >
              Register Trade Account
            </Link>
            <Link
              href="/catalogue"
              className="border border-stone-700 bg-stone-800/70 px-5 py-3.5 text-center text-xs font-semibold tracking-wider text-white uppercase transition-colors hover:border-stone-500 hover:bg-stone-800"
            >
              Browse Public Catalogue
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
