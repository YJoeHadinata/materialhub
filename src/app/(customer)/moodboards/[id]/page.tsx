import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireApprovedTradeMemberPage } from "@/server/authorization";
import { getMoodboardByIdForUser } from "@/server/services/moodboard.service";
import { queryPublicCatalogue } from "@/server/services/product.service";
import { MoodboardDetailEditor } from "@/components/moodboards/moodboard-detail-editor";
import { WorkspaceNotice } from "@/components/ui/workspace-notice";
import { AppError } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export default async function MoodboardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireApprovedTradeMemberPage();
  if (!auth.authorized) {
    return auth.response;
  }
  const currentUser = auth.user;

  const { id } = await params;

  let board: Awaited<ReturnType<typeof getMoodboardByIdForUser>>;
  try {
    board = await getMoodboardByIdForUser(id, currentUser.id);
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) {
      notFound();
    }
    if (error instanceof AppError && error.statusCode === 403) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-16">
          <WorkspaceNotice
            eyebrow="Access Denied // 403 Forbidden"
            title="Private Moodboard Ownership Enforced"
            description="You do not have permission to view or modify another member's private project moodboard."
            actions={
              <Link
                href="/moodboards"
                className="border border-stone-900 bg-stone-900 px-5 py-2.5 text-xs font-semibold tracking-wider text-white uppercase hover:bg-stone-800"
              >
                Return to Your Moodboards
              </Link>
            }
          />
        </div>
      );
    }
    throw error;
  }

  const catalogue = await queryPublicCatalogue({ pageSize: 48 });
  const existingProductIds = new Set(board.items.map((i) => i.productId));
  const availableProducts = catalogue.items
    .filter((p) => !existingProductIds.has(p.id))
    .map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      materialName: p.materialType.name,
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/moodboards"
          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-stone-600 uppercase hover:text-stone-950"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to All Moodboards</span>
        </Link>
      </div>

      <div className="mb-8 border-b border-stone-200 pb-6">
        <p className="font-mono text-xs font-semibold tracking-widest text-stone-500 uppercase">
          Project Moodboard Workspace
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
          {board.name}
        </h1>
        {board.description && (
          <p className="mt-2 max-w-3xl text-sm text-stone-600">
            {board.description}
          </p>
        )}
      </div>

      <MoodboardDetailEditor
        initialBoard={board}
        availableProducts={availableProducts}
      />
    </div>
  );
}
