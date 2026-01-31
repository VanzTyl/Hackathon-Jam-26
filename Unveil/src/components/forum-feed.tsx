"use client";

import { useState } from "react";
import {
  Plus,
  Bookmark,
  MessageCircle,
  Ghost,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ForumPost {
  id: string;
  title: string;
  author: {
    name: string;
    avatar: string;
    isAnonymous?: boolean;
  };
  timeAgo: string;
  tags: string[];
  content: string;
  highlightedWords: string[];
  responses: { avatar: string }[];
  bookmarked: boolean;
}

const forumPosts: ForumPost[] = [
  {
    id: "1",
    title: "Lecture Rescheduling",
    author: {
      name: "Elisabeth May",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    timeAgo: "6h ago",
    tags: ["Accounting"],
    content:
      "Hi mates,\nso i talked with Dr Hellen and because of her illner we need to reschedule upcoming Lecture. You propably notice that this lecture is the last before exam so Dr Hellen asked us also if we want to attend for additional lecture where we can study more difficult excercise",
    highlightedWords: ["reschedule upcoming Lecture", "additional lecture"],
    responses: [
      { avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
      { avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
      { avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
    ],
    bookmarked: false,
  },
  {
    id: "2",
    title: "Date of the final exams",
    author: {
      name: "Dr Ronald Jackson",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop",
    },
    timeAgo: "3d ago",
    tags: ["Accounting", "Corporate law"],
    content:
      "Dear Students,\nI want to inform you that after 6 months of our cooperation it is necessary to test your knowledge by the final exam. It means we need to find a date for our final exam. In this semester you were extremely under the stress due to COVID-19 situation so would like you to offer an extra attempt for this test. My proposition is...",
    highlightedWords: ["final exam", "extra attempt"],
    responses: [
      { avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" },
      { avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" },
    ],
    bookmarked: true,
  },
  {
    id: "3",
    title: "Anonymous Question about Grades",
    author: {
      name: "Anonymous CIITzen",
      avatar: "",
      isAnonymous: true,
    },
    timeAgo: "1d ago",
    tags: ["Public Finance"],
    content:
      "Hello everyone,\nI wanted to ask about the grading criteria for our midterm. I'm a bit confused about how the curve will be applied. Can anyone who spoke with the professor clarify this for us?",
    highlightedWords: ["grading criteria", "curve"],
    responses: [
      { avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
    ],
    bookmarked: false,
  },
];

interface ForumFeedProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function ForumFeed({ activeTab, onTabChange }: ForumFeedProps) {
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState(forumPosts);
  const router = useRouter();

  const toggleBookmark = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, bookmarked: !post.bookmarked } : post
      )
    );
  };

  const highlightText = (text: string, highlights: string[]) => {
    let result = text;
    for (const highlight of highlights) {
      result = result.replace(
        new RegExp(`(${highlight})`, "gi"),
        '<strong class="font-semibold text-foreground">$1</strong>'
      );
    }
    return result;
  };

  const handleTabClick = (tab: string, path: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
    router.push(path);
  };

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* New Thread Input */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm">
          <div className="h-10 w-10 rounded-full bg-slate-300" />
          <input
            type="text"
            placeholder="Add a new thread"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-lg shadow-accent/25 transition-all hover:bg-accent/90">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-3xl bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              {/* Title */}
              <h2 className="mb-4 text-xl font-bold text-primary">
                {post.title}
              </h2>

              {/* Author & Tags */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {post.author.isAnonymous ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Ghost className="h-5 w-5 text-primary" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full border-2 border-pink-300 bg-slate-300" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {post.author.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {post.timeAgo}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium",
                        tag === "Accounting"
                          ? "border border-accent text-accent"
                          : tag === "Corporate law"
                            ? "bg-accent text-accent-foreground"
                            : "border border-primary/30 text-primary"
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div
                className="mb-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html: highlightText(post.content, post.highlightedWords),
                }}
              />

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleBookmark(post.id)}
                    className={cn(
                      "rounded-lg p-2 transition-colors",
                      post.bookmarked
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Bookmark
                      className={cn("h-5 w-5", post.bookmarked && "fill-current")}
                    />
                  </button>
                  <button className="flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/80">
                    <MessageCircle className="h-4 w-4" />
                    Add Response
                  </button>
                </div>

                {/* Response Avatars */}
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {post.responses.map((response, idx) => (
                      <div
                        key={idx}
                        className="h-8 w-8 rounded-full border-2 border-card bg-slate-300"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Anonymous Post Actions */}
              {post.author.isAnonymous && (
                <div className="mt-4 flex items-center gap-3 border-t border-border/50 pt-4">
                  <button className="flex items-center gap-2 rounded-xl bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/20">
                    <Ghost className="h-4 w-4" />
                    Reveal Identity
                  </button>
                  <button className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
                    <Send className="h-4 w-4" />
                    Request
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
