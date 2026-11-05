"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookmarkPlus, Check, Plus, X } from "lucide-react";
import type { AuthenticatedUser } from "@/types";
import type { MoodboardSummary } from "@/server/services/moodboard.service";
import { Callout } from "@/components/ui/callout";

export function SaveToMoodboardDialog({
  productId,
  productName,
  currentUser,
  initialMoodboards = [],
  variant = "card",
}: {
  productId: string;
  productName: string;
  currentUser: AuthenticatedUser | null;
  initialMoodboards?: MoodboardSummary[];
  variant?: "card" | "detail";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [boards, setBoards] = useState<MoodboardSummary[]>(initialMoodboards);
  const [selectedBoardId, setSelectedBoardId] = useState<string>(
    initialMoodboards[0]?.id ?? "",
  );
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isApproved =
    currentUser?.role === "ADMIN" ||
    (currentUser?.role === "MEMBER" && currentUser.tradeStatus === "APPROVED");

  async function handleOpen() {
    setErrorMsg(null);
    setSuccessMsg(null);
    setOpen(true);

    if (isApproved && boards.length === 0) {
      try {
        const res = await fetch("/api/v1/moodboards");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setBoards(json.data);
          if (json.data[0]?.id) {
            setSelectedBoardId(json.data[0].id);
          }
        }
      } catch {
        // Handled on action
      }
    }
  }

  async function handleAddToExisting(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBoardId) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/v1/moodboards/${selectedBoardId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message ?? "Could not add product to moodboard.");
      } else {
        setSuccessMsg("Added to moodboard.");
        router.refresh();
      }
    } catch {
      setErrorMsg("Network error while saving to moodboard.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAndAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const createRes = await fetch("/api/v1/moodboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBoardName.trim(),
          description: newBoardDescription.trim(),
        }),
      });
      const createJson = await createRes.json();
      if (!createRes.ok || !createJson.success) {
        setErrorMsg(
          createJson.error?.message ?? "Failed to create moodboard.",
        );
        setLoading(false);
        return;
      }

      const createdBoardId = createJson.data.id as string;
      const addRes = await fetch(`/api/v1/moodboards/${createdBoardId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const addJson = await addRes.json();

      if (!addRes.ok || !addJson.success) {
        setErrorMsg(
          addJson.error?.message ?? "Created moodboard, but could not add item.",
        );
      } else {
        setNewBoardName("");
        setNewBoardDescription("");
        setSuccessMsg(`Created "${createJson.data.name}" and added material.`);
        router.refresh();
      }
    } catch {
      setErrorMsg("Network error while creating moodboard.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={
          variant === "detail"
            ? `Add ${productName} to project moodboard`
            : `Save ${productName} to project moodboard`
        }
        className={
          variant === "detail"
            ? "inline-flex w-full items-center justify-center gap-2 border border-stone-900 bg-stone-900 px-6 py-3.5 text-xs font-semibold tracking-wider text-white uppercase transition-colors hover:bg-stone-800 sm:w-auto"
            : "inline-flex items-center gap-1.5 border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-800 transition-colors hover:border-stone-900 hover:bg-stone-900 hover:text-white"
        }
      >
        <BookmarkPlus className="h-3.5 w-3.5" aria-hidden="true" />
        <span>
          {variant === "detail" ? "Add to Project Moodboard" : "Save"}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="moodboard-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4"
        >
          <div className="w-full max-w-md border border-stone-300 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between border-b border-stone-200 pb-4">
              <div>
                <p className="text-xs font-medium tracking-widest text-stone-500 uppercase">
                  Project Specification
                </p>
                <h2
                  id="moodboard-dialog-title"
                  className="mt-1 text-base font-semibold text-stone-900"
                >
                  Save {productName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close modal"
                className="p-1 text-stone-500 hover:text-stone-900"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {!currentUser ? (
              <div className="mt-5 space-y-4">
                <p className="text-sm text-stone-600">
                  Moodboard curation is reserved for registered trade architects,
                  interior designers, and developers.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link
                    href="/login"
                    className="flex-1 border border-stone-900 bg-stone-900 px-4 py-2.5 text-center text-xs font-medium tracking-wider text-white uppercase"
                  >
                    Trade Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 border border-stone-300 bg-white px-4 py-2.5 text-center text-xs font-medium tracking-wider text-stone-900 uppercase"
                  >
                    Apply for Account
                  </Link>
                </div>
              </div>
            ) : !isApproved ? (
              <div className="mt-5 space-y-3">
                <p className="text-sm text-stone-700">
                  Your trade account status is currently{" "}
                  <strong className="font-semibold">
                    {currentUser.tradeStatus}
                  </strong>
                  . Once an administrator approves your trade application, you can
                  create and manage project moodboards.
                </p>
                <Link
                  href="/account"
                  className="inline-block border border-stone-900 px-4 py-2 text-xs font-medium tracking-wider text-stone-900 uppercase"
                >
                  View Account Status
                </Link>
              </div>
            ) : (
              <div className="mt-5 space-y-6">
                {errorMsg && <Callout variant="error">{errorMsg}</Callout>}

                {successMsg && (
                  <div
                    role="status"
                    className="flex items-center justify-between border border-stone-900 bg-stone-950 px-3.5 py-2.5 text-xs text-white"
                  >
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 shrink-0 text-stone-300" aria-hidden="true" />
                      <span>{successMsg}</span>
                    </div>
                    <span className="font-mono text-[10px] tracking-widest text-stone-400 uppercase">
                      Saved
                    </span>
                  </div>
                )}

                {boards.length > 0 && (
                  <form onSubmit={handleAddToExisting} className="space-y-3">
                    <label
                      htmlFor="select-moodboard"
                      className="block text-xs font-semibold tracking-wider text-stone-800 uppercase"
                    >
                      Select Existing Moodboard
                    </label>
                    <select
                      id="select-moodboard"
                      value={selectedBoardId}
                      onChange={(e) => setSelectedBoardId(e.target.value)}
                      className="w-full border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
                    >
                      {boards.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.itemCount} items)
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={loading || !selectedBoardId}
                      className="w-full border border-stone-900 bg-stone-900 px-4 py-2.5 text-xs font-medium tracking-wider text-white uppercase hover:bg-stone-800 disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Add to Selected Moodboard"}
                    </button>
                  </form>
                )}

                <form
                  onSubmit={handleCreateAndAdd}
                  className="space-y-3 border-t border-stone-200 pt-4"
                >
                  <p className="text-xs font-semibold tracking-wider text-stone-800 uppercase">
                    Or Create New Moodboard
                  </p>
                  <div>
                    <label
                      htmlFor="new-board-name"
                      className="block text-xs text-stone-600"
                    >
                      Project / Moodboard Name
                    </label>
                    <input
                      id="new-board-name"
                      type="text"
                      required
                      minLength={2}
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      placeholder="e.g. Civic Library Facade Palette"
                      className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm text-stone-900"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="new-board-desc"
                      className="block text-xs text-stone-600"
                    >
                      Specification Notes (Optional)
                    </label>
                    <input
                      id="new-board-desc"
                      type="text"
                      value={newBoardDescription}
                      onChange={(e) => setNewBoardDescription(e.target.value)}
                      placeholder="Zone, floor level, or client notes"
                      className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm text-stone-900"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !newBoardName.trim()}
                    className="inline-flex w-full items-center justify-center gap-1.5 border border-stone-300 bg-stone-100 px-4 py-2.5 text-xs font-medium tracking-wider text-stone-900 uppercase hover:border-stone-900 disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Create & Add Material</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
