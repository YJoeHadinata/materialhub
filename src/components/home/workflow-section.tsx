export function WorkflowSection() {
  return (
    <section className="border-b border-stone-200/90 bg-stone-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="border-t-2 border-stone-900 pt-4">
            <span className="font-mono text-xs font-semibold text-stone-600">
              01 / DISCOVERY
            </span>
            <h2 className="mt-2 text-sm font-semibold text-stone-950">
              Parametric Technical Filtering
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-stone-600">
              Filter simultaneously by material discipline, surface finish,
              and architectural application with shareable URL parameters for
              design team reviews.
            </p>
          </div>
          <div className="border-t-2 border-stone-900 pt-4">
            <span className="font-mono text-xs font-semibold text-stone-600">
              02 / CURATION
            </span>
            <h2 className="mt-2 text-sm font-semibold text-stone-950">
              Project Moodboard Palettes
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-stone-600">
              Approved trade members organize selected stone, timber, ceramic,
              and metal surfaces into project-specific moodboards with custom
              sequencing.
            </p>
          </div>
          <div className="border-t-2 border-stone-900 pt-4">
            <span className="font-mono text-xs font-semibold text-stone-600">
              03 / SPECIFICATION
            </span>
            <h2 className="mt-2 text-sm font-semibold text-stone-950">
              Verified Trade Governance
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-stone-600">
              Dedicated trade account review workflow, minimum order quantity
              (MOQ) transparency, and full administrative catalogue governance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
