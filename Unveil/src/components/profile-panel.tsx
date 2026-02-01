"use client";

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";
import { User } from "@/lib/database";
import { cn } from "@/lib/utils";

interface Connection {
  id: string;
  name: string;
  color: string; // TailWind background color class
}

const connections: Connection[] = [
  { id: "1", name: "VelvetPanda607", color: "bg-pink-400" },
  { id: "2", name: "JollyKoala714", color: "bg-orange-400" },
  { id: "3", name: "CosmicOtter295", color: "bg-yellow-400" },
  { id: "4", name: "LunarGecko413", color: "bg-green-400" },
  { id: "5", name: "SwiftBadger159", color: "bg-cyan-400" },
  { id: "6", name: "DizzyRaven334", color: "bg-blue-400" },
  { id: "7", name: "StaticTurtle921", color: "bg-violet-400" },
  { id: "8", name: "SecretLynx101", color: "bg-pink-400" },
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

  const displayName = showRealName 
    ? `${user?.first_name} ${user?.last_name}` 
    : currentMaskedName || user?.masked_name || 'Anonymous';

  const roleLabel = maskMode === 'mentor' ? 'Mentor' : 'Mentee';

  return (
    <aside className="flex h-full w-72 flex-col bg-card/80 p-2 backdrop-blur-sm">
      {/* User Profile Card */}
      <div className="mb-2 flex flex-col items-center rounded-3xl bg-gradient-to-b from-background to-card p-4 shadow-sm">
        {/* Main Letter Avatar */}
        <div className={cn(
          "mb-4 flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-black text-white shadow-lg",
          maskMode === 'mentor' ? "bg-gradient-to-br from-orange-400 to-red-500" : "bg-gradient-to-br from-cyan-400 to-blue-500"
        )}>
          {displayName.charAt(0).toUpperCase()}
        </div>

        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-bold text-foreground truncate max-w-[160px]">
            {displayName}
          </h3>
          <button
            onClick={() => setShowRealName(!showRealName)}
            className="flex items-center justify-center rounded-lg p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showRealName ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        
        <span className={cn(
          "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest",
          maskMode === 'mentor' 
            ? "bg-orange-500/10 text-orange-600" 
            : "bg-cyan-500/10 text-cyan-600"
        )}>
          {roleLabel}
        </span>
      </div>

      {/* Connections Section */}
      <div className="flex-1 overflow-hidden flex flex-col px-1">
        <button
          onClick={() => setConnectionsExpanded(!connectionsExpanded)}
          className="my-3 flex w-full items-center justify-between px-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground"
        >
          <span>Connections</span>
          {connectionsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {connectionsExpanded && (
          <div className="space-y-1 overflow-y-auto pr-1">
            {connections.map((connection) => (
              <button
                key={connection.id}
                className="flex w-full items-center gap-3 rounded-xl p-2 transition-all hover:bg-white hover:shadow-sm group"
              >
                {/* Connection Letter Avatar */}
                <div className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white transition-transform group-hover:scale-105",
                  connection.color
                )}>
                  {connection.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground truncate">
                  {connection.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}