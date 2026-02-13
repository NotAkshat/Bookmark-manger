"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bookmark } from "@/types/bookmark";
import { Tabs } from "@/components/ui/tabs";
import { WavyBackground } from "@/components/ui/wavy-background";



export default function Dashboard() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    fetchBookmarks();

    const channel = supabase
      .channel("bookmarks-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
        },
        (payload) => {
          setBookmarks((prev) => [payload.new as Bookmark, ...prev]);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmarks",
        },
        (payload) => {
          setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookmarks(data as Bookmark[]);
    }
  };

  const addBookmark = async () => {
  if (!title.trim() || !url.trim()) {
    alert("Please fill in both Title and URL.");
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase.from("bookmarks").insert([
    {
      title: title.trim(),
      url: url.trim(),
      user_id: user.id,
    },
  ]);

  if (error) {
    console.error(error);
    return;
  }

  setTitle("");
  setUrl("");
};

  const deleteBookmark = async (id: string) => {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);

    if (error) {
      console.error(error);
    }
  };

  const tabs = [
    {
      title: "My Bookmarks",
      value: "bookmarks",
      content: (
        <div className="space-y-4">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="flex justify-between border p-3 rounded"
            >
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                {bookmark.title}
              </a>
              <button
                onClick={() => deleteBookmark(bookmark.id)}
                className="
  text-white
  bg-red-600
  hover:bg-red-700
  px-4
  py-2
  rounded-lg
  font-medium
  shadow-md
  hover:shadow-lg
  transition-all
  duration-200
"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Add Bookmark",
      value: "add",
      content: (
        <div className="flex gap-2">
          <input
            className="bg-white/10 border border-white/20 text-white placeholder-gray-400 p-3 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="bg-white/10 border border-white/20 text-white placeholder-gray-400 p-3 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <button
            onClick={addBookmark}
            className="bg-slate-900 hover:bg-black transition text-white px-6 py-3 rounded-lg font-medium shadow-lg"
          >
            Add
          </button>
        </div>
      ),
    },
  ];

  return (
    <WavyBackground className="min-h-screen">
      <div className="max-w-2xl mx-auto pt-32">
        <h1 className="text-4xl font-bold text-center mb-8">
          Bookmark Manager
        </h1>

        <Tabs
          tabs={tabs}
          containerClassName="justify-center"
          tabClassName="bg-white/10 backdrop-blur-md"
          activeTabClassName="bg-white text-black shadow"
          contentClassName="bg-white/20 backdrop-blur-xl p-6 rounded-2xl shadow-2xl"
        />
      </div>
    </WavyBackground>
  );
}
