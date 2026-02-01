"use client";

import { useState } from "react";
import {
  LogOut,
  Eye,
  RefreshCw,
  Home,
  Signal,
  MessageSquare,
  MessageCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/supabase-client";
import { useRouter, usePathname } from "next/navigation";
import { swapMask } from "@/lib/database";

interface NavItem {
  icon: any;
  label: string;
  route: string;
}

interface SidebarProps {
  maskMode: 'student' | 'mentor';
  setMaskMode: (mode: 'student' | 'mentor') => void;
  userId: string;
  onSwapComplete?: (mode: 'student' | 'mentor') => void;
}

export function Sidebar({
  maskMode,
  setMaskMode,
  userId,
  onSwapComplete,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const navItems: NavItem[] = [
    { icon: RefreshCw, label: "Swap Mask", route: "" },
    { icon: Home, label: "Home", route: "/" },
    { icon: Signal, label: "Signals", route: "/signals" },
    { icon: MessageSquare, label: "Forums", route: "/forums" },
    { icon: MessageCircle, label: "Chat", route: "/chat" },
  ];

  const handleNavChange = (route: string, label: string) => {
    if (route) {
      router.push(route);
    } else if (label === "Swap Mask") {
      setShowSwapModal(true);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await new Promise(resolve => setTimeout(resolve, 100));
    window.location.href = "/login";
  };

  const handleSwapMask = async (newMask: 'student' | 'mentor') => {
    if (isSwapping || maskMode === newMask) return;

    setIsSwapping(true);

    try {
      const result = await swapMask(userId, newMask);
      setMaskMode(newMask);
      setShowSwapModal(false);
      setTimeout(() => {
        if (onSwapComplete) {
          onSwapComplete(newMask);
        }
      }, 500);
    } catch (error: any) {
      console.error('Error swapping mask:', error);
      alert('Failed to swap mask. Please try again.');
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <>
      <aside className="flex h-full w-64 flex-col bg-card/80 backdrop-blur-sm p-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Eye className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-primary">CIIT</h1>
            <p className="text-xs text-gray-600">College of Innovation and Intergrated Technology</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavChange(item.route, item.label)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                pathname === item.route
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6">
          <div className="mb-3 px-4 py-3 rounded-xl bg-primary/10">
            <p className="text-xs text-primary font-medium">Current Mode: {maskMode === 'mentor' ? 'Mentor' : 'Mentee'}</p>
          </div>
          <button onClick={handleSignOut} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-600 hover:shadow-xl hover:shadow-red-500/30">
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </aside>

      {showSwapModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Swap Mask</h2>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Switch between Mentee and Mentor mode to help others or seek help.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleSwapMask('student')}
                disabled={isSwapping}
                className={cn(
                  "flex items-center gap-4 w-full rounded-xl p-4 transition-all",
                  maskMode === 'student'
                    ? "bg-primary text-white shadow-lg"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                )}
              >
                <Users className="h-6 w-6" />
                <div className="text-left">
                  <p className="font-semibold text-lg">Mentee</p>
                  <p className="text-xs opacity-80">Seek help from mentors</p>
                </div>
              </button>

              <button
                onClick={() => handleSwapMask('mentor')}
                disabled={isSwapping}
                className={cn(
                  "flex items-center gap-4 w-full rounded-xl p-4 transition-all",
                  maskMode === 'mentor'
                    ? "bg-primary text-white shadow-lg"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                )}
              >
                <Users className="h-6 w-6" />
                <div className="text-left">
                  <p className="font-semibold text-lg">Mentor</p>
                  <p className="text-xs opacity-80">Help mentees with their questions</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowSwapModal(false)}
              disabled={isSwapping}
              className="mt-6 w-full py-3 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              {isSwapping ? 'Swapping...' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
