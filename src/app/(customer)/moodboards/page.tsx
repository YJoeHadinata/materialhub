import Link from "next/link";
import { requireApprovedTradeMemberPage } from "@/server/authorization";
import { listUserMoodboards } from "@/server/services/moodboard.service";
import { MoodboardWorkspaceList } from "@/components/moodboards/moodboard-workspace-list";

export const dynamic = "force-dynamic";

export default async function MoodboardsPage() {
  const auth = await requireApprovedTradeMemberPage();
  if (!auth.authorized) {
    return auth.response;
  }
  const currentUser = auth.user;

  const boards = await listUserMoodboards(currentUser.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs font-semibold tracking-widest text-stone-500 uppercase">
            Customer Specification Workspace
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
            Project Material Moodboards
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            Organize architectural materials by building zone, facade package,
            or interior palette.
          </p>
        </div>

        <Link
          href="/catalogue"
          className="border border-stone-300 bg-white px-4 py-2.5 text-xs font-semibold tracking-wider text-stone-900 uppercase hover:border-stone-900"
        >
          Add Materials from Catalogue
        </Link>
      </div>

      <MoodboardWorkspaceList initialBoards={boards} />
    </div>
  );
}
