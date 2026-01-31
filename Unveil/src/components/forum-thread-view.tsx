"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Send, Clock } from "lucide-react";
import { supabase } from "@/supabase-client";

interface Response {
  response_id: string;
  content: string;
  created_at: string;
  masked_name?: string; // Optional: if you want anonymous names for replies too
}

export function ForumThreadView({ post, onBack, currentMaskedName, userId }: any) {
  const [responses, setResponses] = useState<Response[]>([]);
  const [newResponse, setNewResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadResponses();
  }, [post.post_id]);

  const loadResponses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("forum_responses")
      .select("*")
      .eq("post_id", post.post_id)
      .order("created_at", { ascending: true });

    if (!error) setResponses(data);
    setLoading(false);
  };

  const handlePostResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResponse.trim() || isSubmitting) return;

    setIsSubmitting(true);
    // [GEMINI UPDATED]: Logic to insert response into forum_responses table 
    const { error } = await supabase
      .from("forum_responses")
      .insert([{
        post_id: post.post_id,
        user_id: userId,
        content: newResponse.trim()
      }]);

    if (!error) {
      setNewResponse("");
      loadResponses();
    }
    setIsSubmitting(false);
  };

  const formatTime = (date: string) => new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-lg truncate">{post.title}</h2>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-8">
        {/* Original Post */}
        <div className="bg-cyan-50/50 p-6 rounded-3xl border border-cyan-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center font-bold">
              {post.masked_name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">@{post.masked_name}</p>
              <p className="text-[10px] text-gray-400 uppercase font-black">{formatTime(post.created_at)}</p>
            </div>
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3">{post.title}</h3>
          <p className="text-gray-700 leading-relaxed">{post.content}</p>
        </div>

        {/* Responses List */}
        <div className="space-y-6">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Responses</h4>
          {loading ? (
            <p className="text-center text-gray-400 py-4">Loading thoughts...</p>
          ) : responses.length === 0 ? (
            <p className="text-center text-gray-400 py-4 italic">No responses yet. Be the first to reply!</p>
          ) : (
            responses.map((res) => (
              <div key={res.response_id} className="flex gap-4 group">
                <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold shrink-0">
                  R
                </div>
                <div className="flex-1 bg-gray-50 p-4 rounded-2xl group-hover:bg-white group-hover:shadow-md transition-all border border-transparent group-hover:border-gray-100">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-gray-900">Anonymous Responder</span>
                    <span className="text-[10px] text-gray-400">{formatTime(res.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{res.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reply Input */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handlePostResponse} className="flex gap-3 bg-gray-50 p-2 rounded-2xl border focus-within:border-cyan-400 transition-all">
          <input 
            placeholder={`Reply as ${currentMaskedName}...`}
            className="flex-1 bg-transparent px-4 py-2 outline-none text-sm"
            value={newResponse}
            onChange={(e) => setNewResponse(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!newResponse.trim() || isSubmitting}
            className="bg-gray-900 text-white p-2 rounded-xl hover:bg-black transition-colors disabled:opacity-30"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}