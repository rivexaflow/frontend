"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageSquare, Plus, Heart, Share2, Filter, RefreshCw, User } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";

type Post = {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  author?: { fullName: string; avatar?: string };
  _count?: { comments: number };
};

export function CommunityView() {
  const companyId = useHrCompanyId();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postModal, setPostModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Form state
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "GENERAL" });

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const categoryParam = selectedCategory !== "ALL" ? `&category=${selectedCategory}` : "";
      const companyParam = companyId ? `?companyId=${companyId}` : "";
      const res = await apiClient.get(`/community/posts${companyParam}${categoryParam}`);
      if (res.data?.success) {
        setPosts(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [companyId, selectedCategory]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/community/posts", {
        ...newPost,
        companyId
      });
      setPostModal(false);
      setNewPost({ title: "", content: "", category: "GENERAL" });
      loadPosts();
    } catch (err) {
      alert("Failed to publish forum post");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Community & Internal Forum</h1>
          <p className="mt-1 text-sm text-slate-500">Share announcements, collaborate on tech discussions, and ask product Q&As.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPostModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            <Plus className="h-4 w-4" /> New Post
          </button>
          <button onClick={loadPosts} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Category Selectors */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "GENERAL", "TECH", "ANNOUNCEMENT", "OFF-TOPIC"].map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`rounded-full px-4 py-1.5 text-xs font-semibold ${selectedCategory === cat ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-850 dark:text-slate-350"}`}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6 max-w-3xl">
          {posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800 bg-white dark:bg-slate-900">
              <MessageSquare className="mx-auto h-12 w-12 text-slate-400" />
              <p className="text-slate-500 mt-4">Be the first to share an announcement on the board!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold dark:bg-indigo-950/20">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm text-slate-900 dark:text-white">{post.author?.fullName || "Collaborator"}</h5>
                    <span className="text-[10px] text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{post.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{post.content}</p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button className="flex items-center gap-1 hover:text-rose-600">
                    <Heart className="h-4 w-4" /> Like
                  </button>
                  <button className="flex items-center gap-1 hover:text-indigo-600">
                    <MessageSquare className="h-4 w-4" /> Comments ({post._count?.comments || 0})
                  </button>
                  <span className="rounded bg-indigo-50 text-indigo-700 px-2 py-0.5 font-bold uppercase tracking-wider text-[9px]">
                    {post.category}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Post Modal */}
      {postModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreatePost} className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Post to Board</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500">Category</label>
                <select value={newPost.category} onChange={e => setNewPost(p => ({ ...p, category: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800 dark:bg-slate-800">
                  <option value="GENERAL">GENERAL</option>
                  <option value="TECH">TECH</option>
                  <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
                  <option value="OFF-TOPIC">OFF-TOPIC</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500">Post Title</label>
                <input required type="text" value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" placeholder="Give your post a concise title" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500">Content Description</label>
                <textarea required rows={5} value={newPost.content} onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800 text-sm" placeholder="Write out post details..." />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
              <button type="button" onClick={() => setPostModal(false)} className="rounded-lg px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Publish Post</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
