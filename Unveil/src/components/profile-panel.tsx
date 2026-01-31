"use client";

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";
import { User, getCurrentMode } from "@/lib/database";
import { cn } from "@/lib/utils";

interface Connection {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

const connections: Connection[] = [
  {
    id: "1",
    name: "Leslie Alexander",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    color: "border-pink-400",
  },
  {
    id: "2",
    name: "Darlene Robertson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    color: "border-orange-400",
  },
  {
    id: "3",
    name: "Albert Flores",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    color: "border-yellow-400",
  },
  {
    id: "4",
    name: "Jane Cooper",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    color: "border-green-400",
  },
  {
    id: "5",
    name: "Brooklyn Simmons",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100",
    color: "border-cyan-400",
  },
  {
    id: "6",
    name: "Annette Black",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    color: "border-blue-400",
  },
  {
    id: "7",
    name: "Cameron Williamson",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    color: "border-violet-400",
  },
  {
    id: "8",
    name: "Jenny Wilson",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
    color: "border-pink-400",
  },
];

interface ProfilePanelProps {
  user: User & { masked_name?: string } | null;
  maskMode: 'student' | 'mentor';
  setMaskMode: (mode: 'student' | 'mentor') => void;
  userId: string;
}

export function ProfilePanel({ user, maskMode, setMaskMode, userId }: ProfilePanelProps) {
  const [showRealName, setShowRealName] = useState(false);
  const [connectionsExpanded, setConnectionsExpanded] = useState(true);
  const [currentMaskedName, setCurrentMaskedName] = useState<string>('');

  useEffect(() => {
    const loadMaskedName = async () => {
      if (!userId) return;

      const { supabase } = await import('@/supabase-client');
      const tableName = maskMode === 'mentor' ? 'mentors' : 'mentees';

      const { data: maskedData } = await supabase
        .from(tableName)
        .select('masked_name')
        .eq('user_id', userId)
        .maybeSingle();

      setCurrentMaskedName(maskedData?.masked_name || user?.masked_name || '');
    };

    loadMaskedName();
  }, [userId, maskMode, user?.masked_name]);

  const getDisplayName = () => {
    if (showRealName) {
      return `${user?.first_name} ${user?.last_name}`;
    }
    return currentMaskedName || user?.masked_name || 'Anonymous';
  };

  const displayName = getDisplayName();
  const roleLabel = maskMode === 'mentor' ? 'Mentor' : 'Mentee';

  return (
    <aside className="flex h-full w-72 flex-col bg-card/80 p-2 backdrop-blur-sm">
      {/* User Profile Card */}
      <div className="mb-2 flex flex-col items-center rounded-3xl bg-gradient-to-b from-background to-card p-3">
        <div className="mb-4 h-24 w-24 rounded-full border-4 border-card bg-slate-300 shadow-lg" />
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-semibold text-foreground">
            {displayName || 'Anonymous'}
          </h3>
          <button
            onClick={() => setShowRealName(!showRealName)}
            className="flex items-center justify-center rounded-lg p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showRealName ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <span className={cn(
          "rounded-full px-4 py-1 text-sm font-medium",
          maskMode === 'mentor'
            ? "bg-orange-500/10 text-orange-600"
            : "bg-accent/10 text-accent"
        )}>
          {roleLabel}
        </span>
      </div>

      {/* Connections */}
      <div className="flex-1 overflow-hidden">
        <button
          onClick={() => setConnectionsExpanded(!connectionsExpanded)}
          className="mb-2 flex w-full items-center justify-between text-sm font-semibold text-foreground"
        >
          <span>Connections</span>
          {connectionsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {connectionsExpanded && (
          <div className="space-y-2 overflow-y-auto">
            {connections.map((connection) => (
              <button
                key={connection.id}
                className="flex w-full items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
              >
                <div className={`h-9 w-9 rounded-full border-2 bg-slate-300 ${connection.color}`} />
                <span className="text-sm text-foreground">{connection.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
