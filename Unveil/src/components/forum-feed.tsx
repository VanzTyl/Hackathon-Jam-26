"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, MessageSquare, Clock, Send, ArrowLeft, X, Hash } from "lucide-react";
import { supabase } from "@/supabase-client";
import { getForumPosts, getCurrentMode } from "@/lib/database";

export function ForumFeed({ userId, maskMode: propMaskMode }: { userId: string, maskMode: 'student' | 'mentor' }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentMaskedName, setCurrentMaskedName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
  
  // Response System State
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [newResponse, setNewResponse] = useState("");
  const [responses, setResponses] = useState<any[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  // Tag Filter State
  const [showTagFilterModal, setShowTagFilterModal] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<{ name: string; count: number }[]>([]);

  // updated by gemini: Time formatter for "4:26 AM" style
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const currentMode = propMaskMode || await getCurrentMode(userId);
      const tableName = currentMode === 'mentor' ? 'mentors' : 'mentees';
      const { data: maskedData } = await supabase.from(tableName).select('masked_name').eq('user_id', userId).maybeSingle();
      
      setCurrentMaskedName(maskedData?.masked_name || 'Anonymous');

      const data = await getForumPosts();
      const postsWithCounts = await Promise.all(data.map(async (post: any) => {
        const { count } = await supabase.from('forum_responses').select('*', { count: 'exact', head: true }).eq('post_id', post.post_id);
        return { ...post, response_count: count || 0 };
      }));
      setPosts(postsWithCounts);
      
      extractAndSetTags(postsWithCounts);
    } catch (error) {
      console.error('Load Error:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, propMaskMode]);

  const extractAndSetTags = (posts: any[]) => {
    const tagMap = new Map<string, number>();
    posts.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag: string) => {
          const normalizedTag = tag.trim().toLowerCase();
          if (normalizedTag) {
            tagMap.set(normalizedTag, (tagMap.get(normalizedTag) || 0) + 1);
          }
        });
      }
    });

    const sortedTags = Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    setAllTags(sortedTags);
  };

  const handleToggleTag = (tagName: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagName)) {
        return prev.filter(t => t !== tagName);
      } else {
        return [...prev, tagName];
      }
    });
  };

  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  const filteredPosts = selectedTags.length > 0 
    ? posts.filter(post => {
        if (!post.tags || !Array.isArray(post.tags)) return false;
        const postTags = post.tags.map((t: string) => t.trim().toLowerCase());
        return selectedTags.every(selectedTag => postTags.includes(selectedTag));
      })
    : posts;

  useEffect(() => { loadData(); }, [loadData]);

  // updated by gemini: Load responses for selected thread
  const loadResponses = async (postId: string) => {
    setLoadingResponses(true);
    const { data, error } = await supabase
      .from('forum_responses')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (!error) setResponses(data || []);
    setLoadingResponses(false);
  };

  useEffect(() => {
    if (selectedPost) loadResponses(selectedPost.post_id);
  }, [selectedPost]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const tagsArray = newPost.tags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const { error } = await supabase.from('forum_posts').insert([{
        user_id: userId,
        title: newPost.title,
        content: newPost.content,
        masked_name: currentMaskedName,
        is_anonymous: true,
        tags: tagsArray
      }]);
      if (error) throw error;
      setNewPost({ title: '', content: '', tags: '' });
      setShowCreateModal(false);
      loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResponse.trim() || !selectedPost || isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // updated by gemini: Insert the actual masked_name of the responder
      const { error } = await supabase.from('forum_responses').insert([{
        post_id: selectedPost.post_id,
        user_id: userId,
        content: newResponse.trim(),
        masked_name: currentMaskedName 
      }]);

      if (error) throw error;
      
      setNewResponse("");
      await loadResponses(selectedPost.post_id);
      loadData(); 
    } catch (err) {
      console.error("Reply Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // updated by gemini: THREAD VIEW (Individual Post + Responses)
  if (selectedPost) {
    return (
      <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b flex items-center gap-4">
          <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft /></button>
          <h2 className="font-black text-xl text-gray-900 truncate">{selectedPost.title}</h2>
        </div>
        <div className="flex-1 overflow-auto p-8 space-y-8">
          {/* Main Thread Body */}
          <div className="bg-cyan-50/50 p-8 rounded-[2rem] border border-cyan-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center font-bold">
                {selectedPost.masked_name?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">@{selectedPost.masked_name}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">{formatTime(selectedPost.created_at)}</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg">{selectedPost.content}</p>
          </div>

          {/* Response List */}
          <div className="space-y-6">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Discussion Responses</h4>
            {loadingResponses ? (
              <p className="text-sm text-gray-400 ml-2">Loading responses...</p>
            ) : responses.length === 0 ? (
              <p className="text-sm text-gray-400 italic ml-2">No responses yet.</p>
            ) : (
              responses.map((res) => (
                <div key={res.response_id} className="flex gap-4 group">
                  <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {res.masked_name?.charAt(0) || 'R'}
                  </div>
                  <div className="flex-1 bg-gray-50 p-4 rounded-2xl border border-transparent group-hover:bg-white group-hover:border-gray-100 transition-all">
                    <div className="flex justify-between mb-1">
                      {/* updated by gemini: Show responder's masked name */}
                      <span className="text-xs font-bold text-cyan-600 italic">
                        @{res.masked_name || 'Anonymous'}
                      </span>
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
        <div className="p-6 border-t bg-white">
          <form onSubmit={handlePostResponse} className="flex gap-3 bg-gray-50 p-2 rounded-2xl border focus-within:border-cyan-400 transition-all shadow-sm">
            <input 
              placeholder={`Reply as ${currentMaskedName}...`} 
              className="flex-1 bg-transparent px-4 py-2 outline-none text-sm" 
              value={newResponse} 
              onChange={(e) => setNewResponse(e.target.value)} 
            />
            <button 
              type="submit" 
              disabled={!newResponse.trim() || isSubmitting}
              className="bg-gray-900 text-white p-3 rounded-xl hover:bg-black transition-colors disabled:opacity-30"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // updated by gemini: MAIN FEED VIEW
  return (
    <div className="flex flex-col h-full bg-[#F8F9FB] p-8 overflow-hidden">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Community Forum</h1>
          <p className="text-gray-500 mt-1">Discuss and grow anonymously with others.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowTagFilterModal(true)}
            className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-2xl font-bold shadow-lg shadow-gray-200/50 transition-all active:scale-95 flex items-center gap-2 border border-gray-200"
          >
            <Hash size={20}/> {selectedTags.length > 0 ? `${selectedTags.length} Tags` : 'Add Tags'}
          </button>
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-cyan-200 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={20}/> New Thread
          </button>
        </div>
      </div>

      {selectedTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Filters:</span>
          {selectedTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleToggleTag(tag)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-700 hover:bg-cyan-200 transition-colors"
            >
              <Hash size={12} /> {tag}
              <X size={12} />
            </button>
          ))}
          <button
            onClick={clearTagFilters}
            className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
          >
            Clear All
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto space-y-6 pr-2">
        {loading ? ( 
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mb-4" />
            <p>Gathering discussions...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p>No posts found matching your filters.</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div 
              key={post.post_id} 
              onClick={() => setSelectedPost(post)} 
              className="bg-white rounded-3xl p-6 border border-gray-100 hover:border-cyan-200 hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="flex gap-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center text-xl font-black shrink-0">
                  {post.masked_name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100 italic">
                      @{post.masked_name}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {formatTime(post.created_at)}
                    </span>
                  </div>
                  <h4 className="text-xl font-extrabold text-gray-900 group-hover:text-cyan-600 mb-2 transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-gray-600 line-clamp-2 leading-relaxed mb-3">{post.content}</p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag: string, idx: number) => (
                        <span key={idx} className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-1 text-cyan-600 font-bold text-sm bg-cyan-50/50 px-3 py-1.5 rounded-xl group-hover:bg-cyan-50 transition-colors">
                      <MessageSquare size={16} /> {post.response_count} Responses
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* updated by gemini: CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Create Thread</h2>
                <div className="mt-2 bg-cyan-50 border border-cyan-100 px-3 py-1.5 rounded-full w-fit">
                   <p className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">Posting as: {currentMaskedName}</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full">
                <X size={24}/>
              </button>
            </div>
            <form onSubmit={handleCreatePost} className="space-y-6">
              <input 
                placeholder="Title" 
                className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:bg-white focus:border-cyan-400 font-bold text-gray-900 transition-all" 
                value={newPost.title} 
                onChange={e => setNewPost({...newPost, title: e.target.value})} 
                required 
              />
              <textarea 
                placeholder="What's on your mind?" 
                className="w-full p-4 bg-gray-50 border rounded-2xl h-40 outline-none focus:bg-white focus:border-cyan-400 resize-none leading-relaxed transition-all" 
                value={newPost.content} 
                onChange={e => setNewPost({...newPost, content: e.target.value})} 
                required 
              />
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tags (comma separated)</label>
                <input 
                  placeholder="e.g., coding, help, javascript" 
                  className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:bg-white focus:border-cyan-400 text-gray-900 transition-all" 
                  value={newPost.tags} 
                  onChange={e => setNewPost({...newPost, tags: e.target.value})} 
                />
                {newPost.tags && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newPost.tags.split(',').filter(t => t.trim()).map((tag, idx) => (
                      <span key={idx} className="text-xs font-bold bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 font-bold text-gray-400 hover:text-gray-600">Discard</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-[2] p-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Thread'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAG FILTER MODAL */}
      {showTagFilterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Filter by Tags</h2>
                <p className="text-sm text-gray-500 mt-1">Select multiple tags to filter posts</p>
              </div>
              <button onClick={() => setShowTagFilterModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full">
                <X size={24}/>
              </button>
            </div>

            <div className="flex-1 overflow-auto pr-2">
              {allTags.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Hash size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No tags available yet.</p>
                  <p className="text-sm">Create posts with tags to see them here!</p>
                </div>
              ) : (
                <>
                  {allTags.slice(0, 8).length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xs font-black text-cyan-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Hash size={14} /> Popular
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {allTags.slice(0, 8).map((tag) => (
                          <button
                            key={tag.name}
                            onClick={() => handleToggleTag(tag.name)}
                            className={`
                              px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95
                              ${selectedTags.includes(tag.name) 
                                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-200' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                            `}
                          >
                            #{tag.name}
                            <span className="ml-1 text-xs opacity-75">({tag.count})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {allTags.slice(8).length > 0 && (
                    <div>
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Hash size={14} /> More
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {allTags.slice(8).map((tag) => (
                          <button
                            key={tag.name}
                            onClick={() => handleToggleTag(tag.name)}
                            className={`
                              px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95
                              ${selectedTags.includes(tag.name) 
                                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-200' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                            `}
                          >
                            #{tag.name}
                            <span className="ml-1 text-xs opacity-75">({tag.count})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {selectedTags.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-700">{selectedTags.length} tags selected:</span>
                    <button
                      onClick={clearTagFilters}
                      className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <button
                    onClick={() => setShowTagFilterModal(false)}
                    className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition-all"
                  >
                    Apply Filters
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleToggleTag(tag)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-700 hover:bg-cyan-200 transition-colors"
                    >
                      #{tag}
                      <X size={12} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}