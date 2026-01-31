"use client"

import React, { useState, useRef, FormEvent } from "react"
import { Send, Search, MoreHorizontal } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { ProfilePanel } from "@/components/profile-panel"

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{ id: number; text: string; me?: boolean }>>([
    { id: 1, text: "Hey! Did you get the notes from yesterday's lecture?", me: false },
    { id: 2, text: "Yes I did! They were really comprehensive", me: true },
    { id: 3, text: "Great! Can you share them with me? I missed the class", me: false },
  ])
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [activeNav, setActiveNav] = useState("Home")
  const [activeCourse, setActiveCourse] = useState<string | null>(null)
  const [maskMode] = useState(false)

  function sendMessage(e?: FormEvent) {
    if (e) e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    setMessages((m) => [...m, { id: Date.now(), text: trimmed, me: true }])
    setInput("")
    inputRef.current?.focus()
  }

  const conversations = [
    { id: 1, name: "Elisabeth May", snippet: "Thanks for the notes! Really helpful", online: true },
    { id: 2, name: "Dr Ronald Jackson", snippet: "Please submit by Friday", online: false },
    { id: 3, name: "Anonymous CITizen", snippet: "Can you help me with the project?", online: false },
  ]

  return (
    <div className="h-screen bg-[#F8F9FB] text-gray-800">
      <div className="h-full flex gap-0">
        {/* Left dashboard sidebar */}
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          activeCourse={activeCourse}
          setActiveCourse={setActiveCourse}
          maskMode={maskMode}   
        />

        {/* Center content: conversations + chat */}
        <div className="flex-1 overflow-auto h-full">
          <div className="h-full grid grid-cols-12 gap-0 items-stretch">
            {/* Conversation List */}
            <div className="col-span-12 lg:col-span-3 bg-white rounded-0 p-4 shadow-sm h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <input
                    placeholder="Search messages..."
                    className="w-full border border-gray-100 rounded-full py-2 px-3 text-sm bg-gray-50"
                  />
                  <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
                </div>
                <MoreHorizontal className="text-gray-400" />
              </div>

              <div className="flex-1 overflow-auto space-y-3">
                {conversations.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                    <div className="w-11 h-11 rounded-full bg-[#E9F3FF] flex items-center justify-center text-sm font-semibold text-[#0084FF]">
                      {c.name.split(" ")[0].charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{c.name}</div>
                        <div className="text-xs text-gray-400">2m</div>
                      </div>
                      <div className="text-xs text-gray-400">{c.snippet}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Window */}
            <div className="col-span-12 lg:col-span-9 bg-white rounded-0 shadow-sm h-full flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#E9F3FF] flex items-center justify-center text-[#0084FF] font-semibold">E</div>
                  <div>
                    <div className="text-md font-semibold">Elisabeth May</div>
                    <div className="flex items-center gap-2 text-xs text-green-500">
                      <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                      Online
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">10:35 AM</div>
              </div>

              <div className="flex-1 p-6 overflow-auto bg-transparent">
                <div className="space-y-4">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`px-4 py-2 text-sm leading-snug max-w-[78%] ${
                          m.me
                            ? "bg-[#0084FF] text-white rounded-[18px] rounded-br-[6px]"
                            : "bg-[#F0F2F5] text-gray-800 rounded-[18px] rounded-bl-[6px]"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={sendMessage} className="border-t border-gray-100 px-6 py-4 bg-white">
                <div className="flex items-center gap-3">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-50 border border-gray-100 rounded-full py-3 px-4 text-sm focus:outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="Send message"
                    className="w-12 h-12 bg-[#0084FF] rounded-full inline-flex items-center justify-center text-white hover:brightness-90 shadow"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right profile panel */}
        <ProfilePanel />
      </div>
    </div>
  )
}
