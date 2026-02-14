"use client";

import { supabase } from "../lib/supabaseClient";

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <svg width="80" height="80" viewBox="0 0 24 24" className="mx-auto mb-4 text-gray-300" fill="none" aria-hidden>
        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 7V5a4 4 0 018 0v2" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <h3 className="text-lg font-medium">No bookmarks yet</h3>
      <p className="mt-2 text-sm text-gray-500">Add your first bookmark using the form above — it will appear here instantly.</p>
    </div>
  );
}

export default function BookmarkList({ bookmarks = [], loading = false, setBookmarks, session }) {
  const deleteBookmark = async (id) => {
    if (!confirm("Delete this bookmark?")) return;
    try {
      const { error } = await supabase.from("bookmarks").delete().eq("id", id).eq("user_id", session.user.id);
      if (error) {
        console.error("Delete error:", error);
        alert("Failed to delete bookmark");
      } else {
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error("Unexpected delete error:", err);
      alert("Unexpected error while deleting");
    }
  };

  if (loading) {
    // show skeleton cards
    return (
      <div className="space-y-3">
        {[1,2,3].map((n) => (
          <div key={n} className="p-4 surface">
            <div className="h-4 w-48 skeleton mb-2"></div>
            <div className="h-3 w-72 skeleton mb-2"></div>
            <div className="h-3 w-32 skeleton"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!bookmarks || bookmarks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((b) => (
        <div key={b.id} className="p-4 surface flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <a href={b.url} target="_blank" rel="noopener noreferrer" className="font-medium text-sky-600 hover:underline break-ellipsis">
              {b.title}
            </a>
            <div className="text-sm text-gray-500 break-ellipsis">{b.url}</div>
            <div className="text-xs text-gray-400 mt-2">{new Date(b.created_at).toLocaleString()}</div>
          </div>

          <div className="flex items-center gap-2 mt-3 sm:mt-0">
            <a href={b.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 border rounded text-sm text-gray-700 hover:bg-gray-50">Open</a>
            <button onClick={() => deleteBookmark(b.id)} className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:opacity-95">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
