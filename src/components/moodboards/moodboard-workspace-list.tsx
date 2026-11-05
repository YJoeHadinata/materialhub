"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import type { MoodboardSummary } from "@/server/services/moodboard.service";
import { Callout } from "@/components/ui/callout";
import { formatDate } from "@/lib/utils/format";
import { isSvgImageUrl } from "@/lib/utils/image";

export function MoodboardWorkspaceList({
  initialBoards,
}: {
  initialBoards: MoodboardSummary[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/moodboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "Failed to create moodboard.");
      } else {
        setName("");
        setDescription("");
        router.refresh();
      }
    } catch {
      setError("Network error while creating moodboard.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(boardId: string, boardName: string) {
    if (!window.confirm(`Delete moodboard "${boardName}"?`)) {
      return;
    }
    setDeletingId(boardId);
    setError(null);

    try {
      const res = await fetch(`/api/v1/moodboards/${boardId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message ?? "Failed to delete moodboard.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error while deleting moodboard.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-10">
      {/* CREATE MOODBOARD FORM */}
      <form
        onSubmit={handleCreate}
        className="border border-stone-200 bg-white p-6"
      >
        <h2 className="text-xs font-semibold tracking-widest text-stone-500 uppercase">
          New Project Palette
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-4">
            <label
              htmlFor="create-mb-name"
              className="block text-xs font-semibold text-stone-800 uppercase"
            >
              Moodboard Name *
            </label>
            <input
              id="create-mb-name"
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Harbor Tower Podium & Lobby"
              className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm text-stone-900"
            />
          </div>

          <div className="md:col-span-6">
            <label
              htmlFor="create-mb-desc"
              className="block text-xs font-semibold text-stone-800 uppercase"
            >
              Architectural Scope / Notes
            </label>
            <input
              id="create-mb-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Material palette for ground floor concourse and reception monolith"
              className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm text-stone-900"
            />
          </div>

          <div className="flex items-end md:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex w-full items-center justify-center gap-1.5 border border-stone-900 bg-stone-900 px-4 py-2.5 text-xs font-semibold tracking-wider text-white uppercase hover:bg-stone-800 disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{creating ? "Creating..." : "Create"}</span>
            </button>
          </div>
        </div>

        {error && <Callout variant="error" className="mt-4">{error}</Callout>}
      </form>

      {/* MOODBOARDS GRID */}
      {initialBoards.length === 0 ? (
        <div className="border border-stone-200 bg-white p-12 text-center">
          <h3 className="text-base font-semibold text-stone-900">
            No project moodboards created yet
          </h3>
          <p className="mt-1 text-xs text-stone-600">
            Create your first moodboard above or save materials directly from
            the product catalogue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {initialBoards.map((board) => (
            <article
              key={board.id}
              className="flex flex-col justify-between border border-stone-200 bg-white"
            >
              <div>
                <Link
                  href={`/moodboards/${board.id}`}
                  className="grid grid-cols-2 gap-0.5 bg-stone-200 aspect-16/9 overflow-hidden border-b border-stone-200"
                >
                  {board.previewImages.length > 0 ? (
                    board.previewImages.map((img, i) => (
                      <div key={i} className="relative h-full w-full overflow-hidden">
                        <Image
                          src={img.imageUrl}
                          alt={img.altText}
                          fill
                          sizes="(min-width: 1024px) 16vw, (min-width: 768px) 25vw, 50vw"
                          className="object-cover"
                          unoptimized={isSvgImageUrl(img.imageUrl)}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 flex items-center justify-center bg-stone-100 text-xs tracking-wider text-stone-500 uppercase">
                      Empty Material Palette
                    </div>
                  )}
                </Link>

                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-mono uppercase">
                      {board.itemCount}{" "}
                      {board.itemCount === 1 ? "Material" : "Materials"}
                    </span>
                    <span>Updated {formatDate(board.updatedAt)}</span>
                  </div>

                  <h3 className="mt-2 text-lg font-semibold text-stone-900">
                    <Link
                      href={`/moodboards/${board.id}`}
                      className="hover:underline"
                    >
                      {board.name}
                    </Link>
                  </h3>

                  {board.description && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-stone-600">
                      {board.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-stone-100 px-5 py-3.5">
                <Link
                  href={`/moodboards/${board.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-stone-900 uppercase hover:underline"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>

                <button
                  type="button"
                  onClick={() => handleDelete(board.id, board.name)}
                  disabled={deletingId === board.id}
                  aria-label={`Delete moodboard ${board.name}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-red-800 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Delete</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
