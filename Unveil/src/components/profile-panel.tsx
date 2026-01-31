"use client";

import { Phone, Mail, ChevronUp } from "lucide-react";

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

export function ProfilePanel() {
  return (
    <aside className="flex h-full w-72 flex-col bg-card/80 p-6 backdrop-blur-sm">
      {/* Course Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-primary">Accounting</h2>
        <p className="text-xs text-muted-foreground">Group: Rz160015</p>
      </div>

      {/* Tutor Profile Card */}
      <div className="mb-6 flex flex-col items-center rounded-3xl bg-gradient-to-b from-background to-card p-6">
        <div className="mb-4 h-24 w-24 rounded-full border-4 border-card bg-slate-300 shadow-lg" />
        <h3 className="mb-1 text-lg font-semibold text-foreground">
          Dr Ronald Jackson
        </h3>
        <span className="mb-4 rounded-full bg-accent/10 px-4 py-1 text-sm font-medium text-accent">
          Tutor
        </span>

        {/* Contact Buttons */}
        <div className="flex w-full flex-col gap-2">
          <button className="flex items-center justify-center gap-2 rounded-xl border border-accent bg-accent/5 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10">
            <Phone className="h-4 w-4" />
            Student Number
          </button>
          <button className="flex items-center justify-center gap-2 rounded-xl border border-accent bg-accent/5 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10">
            <Mail className="h-4 w-4" />
            CIIT Email
          </button>
        </div>
      </div>

      {/* Connections */}
      <div className="flex-1 overflow-hidden">
        <button className="mb-4 flex w-full items-center justify-between text-sm font-semibold text-foreground">
          <span>Connections</span>
          <ChevronUp className="h-4 w-4" />
        </button>

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
      </div>
    </aside>
  );
}
