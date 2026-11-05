import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="font-mono text-xs font-semibold tracking-widest text-stone-500 uppercase">
        404 // Resource Not Found
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
        The requested material specification or page could not be found.
      </h1>
      <p className="mt-3 text-sm text-stone-600">
        Verify the product slug or return to the main architectural material
        catalogue.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/catalogue"
          className="border border-stone-900 bg-stone-900 px-5 py-2.5 text-xs font-semibold tracking-wider text-white uppercase"
        >
          Browse Catalogue
        </Link>
        <Link
          href="/"
          className="border border-stone-300 bg-white px-5 py-2.5 text-xs font-semibold tracking-wider text-stone-900 uppercase"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
