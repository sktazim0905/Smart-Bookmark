"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function BookmarkForm({ session, setBookmarks }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const addBookmark = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl = "https://" + normalizedUrl;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .insert([
          { user_id: session.user.id, title: title.trim(), url: normalizedUrl },
        ])
        .select()
        .single();

      if (error) {
        console.error("Insert error:", error);
        alert(error.message ?? "Failed to add bookmark");
      } else if (data) {
        setBookmarks((prev) => [data, ...prev]);
        setTitle("");
        setUrl("");
      }
    } catch (err) {
      console.error("Unexpected insert error:", err);
      alert("Unexpected error when adding bookmark");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={addBookmark} className="grid gap-3 sm:grid-cols-12 items-center">
      <div className="sm:col-span-5">
        <label className="sr-only" htmlFor="bookmark-title">Title</label>
        <input
          id="bookmark-title"
          className="input w-full"
          placeholder="Title (e.g. Learn React)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          aria-label="Bookmark title"
        />
      </div>

      <div className="sm:col-span-5">
        <label className="sr-only" htmlFor="bookmark-url">URL</label>
        <input
          id="bookmark-url"
          className="input w-full"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-label="Bookmark URL"
        />
      </div>

      <div className="sm:col-span-2 flex items-center">
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-400 text-white rounded shadow-md hover:translate-y-[-1px] transition-transform"
          aria-disabled={loading}
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.4)" strokeWidth="4"></circle>
              <path d="M22 12a10 10 0 10-10 10" stroke="white" strokeWidth="4" strokeLinecap="round"></path>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
          <span>{loading ? "Adding..." : "Add"}</span>
        </button>
      </div>
    </form>
  );
}
