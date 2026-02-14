"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import BookmarkForm from "./components/BookmarkForm";
import BookmarkList from "./components/BookmarkList";

export default function Home() {
  const [session, setSession] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(false);
  const realtimeChannelRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mountedRef.current) return;
        setSession(data?.session ?? null);
      } catch (err) {
        console.error("Failed to get session:", err);
      }
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mountedRef.current) return;
      setSession(newSession ?? null);
    });

    return () => {
      mountedRef.current = false;
      try {
        authListener?.subscription?.unsubscribe?.();
      } catch (e) {}
    };
  }, []);

  const fetchBookmarks = useCallback(async () => {
    if (!session?.user?.id) {
      setBookmarks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) console.error("Fetch bookmarks error:", error);
      else if (mountedRef.current) setBookmarks(data ?? []);
    } catch (err) {
      console.error("Unexpected fetchBookmarks error:", err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  useEffect(() => {
    const cleanupChannel = () => {
      try {
        if (realtimeChannelRef.current) {
          supabase.removeChannel(realtimeChannelRef.current);
          realtimeChannelRef.current = null;
        }
      } catch (err) {
        console.warn("Error removing realtime channel:", err);
      }
    };

    if (!session?.user?.id) {
      cleanupChannel();
      return;
    }

    const channelName = `bookmarks:uid:${session.user.id}`;

    if (realtimeChannelRef.current?.name === channelName) return;

    cleanupChannel();

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          const record = payload?.new ?? payload?.old;
          if (!record) return;

          if (payload.eventType === "INSERT") {
            setBookmarks((prev = []) => {
              if (prev.find((x) => x.id === record.id)) return prev;
              return [record, ...prev];
            });
            return;
          }

          if (payload.eventType === "UPDATE") {
            setBookmarks((prev = []) => prev.map((b) => (b.id === record.id ? record : b)));
            return;
          }

          if (payload.eventType === "DELETE") {
            setBookmarks((prev = []) => prev.filter((b) => b.id !== record.id));
            return;
          }
        }
      );

    try {
      channel.subscribe();
      realtimeChannelRef.current = channel;
    } catch (err) {
      console.warn("Failed to subscribe to realtime channel:", err);
      realtimeChannelRef.current = null;
    }

    return () => {
      cleanupChannel();
    };
  }, [session]);

  const signIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({ provider: "google" });
    } catch (err) {
      console.error("Sign-in error:", err);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign-out error:", err);
    } finally {
      setBookmarks([]);
      setSession(null);
      try {
        if (realtimeChannelRef.current) {
          supabase.removeChannel(realtimeChannelRef.current);
          realtimeChannelRef.current = null;
        }
      } catch (e) {}
    }
  };

  return (
    <div className="app-container">
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold leading-tight">Smart Bookmark App</h1>
          <p className="mt-1 text-sm text-gray-600">Save and sync your links privately — powered by Supabase.</p>
        </div>

        <div>
          {!session ? (
            <button onClick={signIn} className="btn inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded shadow hover:scale-[1.01] transition-transform">
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none" aria-hidden><path fill="#EA4335" d="M24 9.5v8.5h11.5C34.9 21 30 24.9 24 24.9c-7 0-12.6-5.3-12.6-12s5.6-12 12.6-12z"/><path fill="#FBBC05" d="M35.5 22.5c.6 1.7.9 3.6.9 5.5 0 6.6-4.5 11.9-11.7 11.9-6.8 0-12.2-5.5-12.2-12.3 0-6.8 5.4-12.3 12.2-12.3 3.1 0 5.9 1.1 8 2.9l8.8-8.4C40.2 7 36.3 5 32 5 24.2 5 18 11.7 18 18.8c0 7.1 6.2 13.8 13.9 13.8 8 0 14.1-6.2 14.1-14.1 0-1.1-.1-2.2-.5-3.2z"/></svg>
              Sign in with Google
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-700">{session.user?.email}</div>
              <button onClick={signOut} className="px-3 py-1 bg-red-500 text-white rounded hover:opacity-95">Sign out</button>
            </div>
          )}
        </div>
      </div>

      <div className="surface p-6 space-y-6">
        {!session ? (
          <div className="text-center py-12">
            <h2 className="text-lg font-medium">Welcome 👋</h2>
            <p className="mt-2 text-sm text-gray-600">Sign in to start saving private bookmarks. Your data is protected by Row Level Security (RLS).</p>
          </div>
        ) : (
          <>
            <BookmarkForm session={session} setBookmarks={setBookmarks} />
            <BookmarkList bookmarks={bookmarks} loading={loading} setBookmarks={setBookmarks} session={session} />
          </>
        )}
      </div>

      <footer className="mt-6 text-center text-xs text-gray-500">
        Built with ♥ — keep your bookmarks private.  
      </footer>
    </div>
  );
}
