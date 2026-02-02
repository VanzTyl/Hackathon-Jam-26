"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { ForumFeed } from "@/components/forum-feed";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/supabase-client";
import { getCurrentMode } from "@/lib/database";

export default function ForumsPage() {
  const [activeTab, setActiveTab] = useState("Forums");
  const [maskMode, setMaskMode] = useState<'student' | 'mentor'>('student');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUserId(authUser.id);
        const currentMode = await getCurrentMode(authUser.id);
        setMaskMode(currentMode);
      }
    };
    loadUser();
  }, []);

  const handleMaskModeChange = (newMode: 'student' | 'mentor') => {
    setMaskMode(newMode);
  };

  const handleSwapComplete = async (newMode: 'student' | 'mentor') => {
    if (!userId) return;

    window.location.reload();
  };

  return (
    <AuthGuard>
      <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-pink-100/50 via-background to-violet-100/50">
        {/* Left Sidebar */}
        <Sidebar maskMode={maskMode} setMaskMode={handleMaskModeChange} userId={userId} onSwapComplete={handleSwapComplete} />

        {/* Main Forum Feed - No Profile Panel on right */}
        <div className="flex-1 overflow-hidden">
          <ForumFeed userId={userId} maskMode={maskMode} />
        </div>
      </div>
    </AuthGuard>
  );
}