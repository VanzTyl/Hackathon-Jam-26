"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { ForumFeed } from "@/components/forum-feed";
import { ProfilePanel } from "@/components/profile-panel";

export default function UnveilDashboard() {
  const [activeNav, setActiveNav] = useState("Your Forums");
  const [activeCourse, setActiveCourse] = useState<string | null>("2");
  const [maskMode, setMaskMode] = useState(false);

  // Toggle mask mode when "Switch Mask" is clicked
  const handleNavChange = (nav: string) => {
    if (nav === "Switch Mask") {
      setMaskMode(!maskMode);
    } else {
      setActiveNav(nav);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-pink-100/50 via-background to-violet-100/50">
      {/* Left Sidebar */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={handleNavChange}
        activeCourse={activeCourse}
        setActiveCourse={setActiveCourse}
        maskMode={maskMode}
      />

      {/* Main Forum Feed */}
      <ForumFeed maskMode={maskMode} />

      {/* Right Profile Panel */}
      <ProfilePanel />
    </div>
  );
}
