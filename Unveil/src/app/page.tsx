"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { ForumFeed } from "@/components/forum-feed";
import { ProfilePanel } from "@/components/profile-panel";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/supabase-client";
import { User } from "@/lib/database";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("Home");
  const [user, setUser] = useState<User & { masked_name?: string } | null>(null);
  const [maskMode, setMaskMode] = useState<'student' | 'mentor'>('student');
  const [userId, setUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      setUserId(authUser.id);
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (userData) {
        const currentMode = userData.current_mask || 'student';
        setMaskMode(currentMode);

        const tableName = currentMode === 'mentor' ? 'mentors' : 'mentees';
        const { data: maskedData } = await supabase
          .from(tableName)
          .select('masked_name')
          .eq('user_id', authUser.id)
          .maybeSingle();

        setUser({ ...userData, masked_name: maskedData?.masked_name });
      }
    }
    setIsLoading(false);
  };

  const handleMaskModeChange = async (newMode: 'student' | 'mentor') => {
    setMaskMode(newMode);
    await loadCurrentUser();
  };

  const handleSwapComplete = async (newMode: 'student' | 'mentor') => {
    if (!userId) return;
    // Refresh local user state after identity swap
    const tableName = newMode === 'mentor' ? 'mentors' : 'mentees';
    const { data: maskedData } = await supabase
      .from(tableName)
      .select('masked_name')
      .eq('user_id', userId)
      .maybeSingle();

    if (maskedData) {
      setUser(prev => prev ? { ...prev, masked_name: maskedData.masked_name } : null);
    }
  };

  if (isLoading) return null; // Prevent flash of empty state

  return (
    <AuthGuard>
      <div className="flex h-screen w-full overflow-hidden bg-[#F8F9FB]">
        <Sidebar maskMode={maskMode} setMaskMode={handleMaskModeChange} userId={userId} onSwapComplete={handleSwapComplete} />

        {/* FIXED: Passing userId and maskMode props */}
        <div className="flex-1 overflow-hidden">
           {userId && <ForumFeed userId={userId} maskMode={maskMode} />}
        </div>

        <ProfilePanel user={user} maskMode={maskMode} setMaskMode={handleMaskModeChange} userId={userId} />
      </div>
    </AuthGuard>
  );
}