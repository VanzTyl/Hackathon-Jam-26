"use client";

import { useState } from "react";
import {
  Home,
  MessageSquare,
  Ghost,
  ChevronDown,
  ChevronUp,
  Users,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Course {
  id: string;
  name: string;
  code: string;
  notifications: number;
}

const courses: Course[] = [
  { id: "1", name: "Public Finance", code: "Rz160015", notifications: 1 },
  { id: "2", name: "Accounting", code: "Rz160015", notifications: 3 },
  { id: "3", name: "Corporate law", code: "Rz160015", notifications: 0 },
  { id: "4", name: "Controlling", code: "Rz160015", notifications: 0 },
  { id: "5", name: "Aquisition", code: "Rz160015", notifications: 0 },
];

const navItems = [
  { icon: Home, label: "Home" },
  { icon: MessageSquare, label: "Your Forums" },
  { icon: Ghost, label: "Switch Mask" },
];

interface SidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  activeCourse: string | null;
  setActiveCourse: (course: string | null) => void;
  maskMode: boolean;
}

export function Sidebar({
  activeNav,
  setActiveNav,
  activeCourse,
  setActiveCourse,
  maskMode,
}: SidebarProps) {
  const [coursesExpanded, setCoursesExpanded] = useState(true);

  return (
    <aside className="flex h-full w-64 flex-col bg-card/80 backdrop-blur-sm p-6">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Eye className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-semibold text-primary">CIIT</h1>
          <p className="text-xs text-muted-foreground">University</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveNav(item.label)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
              item.label === "Switch Mask" && maskMode
                ? "bg-accent/10 text-accent"
                : activeNav === item.label
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Courses Section */}
      <div className="mt-8">
        <button
          onClick={() => setCoursesExpanded(!coursesExpanded)}
          className="flex w-full items-center justify-between px-4 py-2 text-sm font-semibold text-foreground"
        >
          <span>Courses ()</span>
          {coursesExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {coursesExpanded && (
          <div className="mt-2 space-y-1">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => setActiveCourse(course.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all",
                  activeCourse === course.id
                    ? "bg-primary/10"
                    : "hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      activeCourse === course.id
                        ? "bg-accent"
                        : "bg-muted-foreground/30"
                    )}
                  />
                  <div>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        activeCourse === course.id
                          ? "text-primary"
                          : "text-foreground"
                      )}
                    >
                      {course.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {course.code}
                    </p>
                  </div>
                </div>
                {course.notifications > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
                    {course.notifications}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Join Forum Button */}
      <div className="mt-auto pt-6">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-pink-500/25 transition-all hover:shadow-xl hover:shadow-pink-500/30">
          <Users className="h-5 w-5" />
          Join a new forum
        </button>
      </div>
    </aside>
  );
}
