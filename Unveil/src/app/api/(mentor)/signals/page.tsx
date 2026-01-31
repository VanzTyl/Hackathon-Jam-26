"use client"

import React, { useState } from "react"
import { Search, Clock, Signal, Zap } from "lucide-react"
import { Sidebar } from "@/components/sidebar"

export default function SignalsPage() {
  const [activeNav, setActiveNav] = useState("Home")
  const [activeCourse, setActiveCourse] = useState<string | null>(null)
  const [maskMode] = useState(false)
  const [activeTab, setActiveTab] = useState("Signals")

  const signals = [
    {
      id: 1,
      name: "Michael Chen",
      course: "Corporate Law",
      message: "I need help understanding the differences between limited liability companies and corporations. The textbook explanation is confusing me.",
      timeLeft: "23h 27m left",
      progressColor: "bg-cyan-400",
      progressPercent: 70,
      avatar: "M",
      avatarBg: "bg-pink-300",
    },
    {
      id: 2,
      name: "Anonymous CITzen",
      course: "Public Finance",
      message: "Can someone explain how fiscal policy affects aggregate demand? I have an exam tomorrow and I'm really confused about the multiplier effect.",
      timeLeft: "22h 42m left",
      progressColor: "bg-cyan-400",
      progressPercent: 65,
      avatar: "A",
      avatarBg: "bg-purple-400",
    },
    {
      id: 3,
      name: "Sarah Johnson",
      course: "Controlling",
      message: "I'm working on the variance analysis assignment and I don't understand how to calculate the labor efficiency variance. Any tutors available?",
      timeLeft: "5h 42m left",
      progressColor: "bg-yellow-400",
      progressPercent: 40,
      avatar: "S",
      avatarBg: "bg-green-400",
    },
    {
      id: 4,
      name: "James Wilson",
      course: "Acquisition",
      message: "Need help with understanding due diligence process in M&A. What are the key areas to focus on?",
      timeLeft: "1h 42m left",
      progressColor: "bg-red-400",
      progressPercent: 20,
      avatar: "J",
      avatarBg: "bg-blue-400",
    },
  ]

  return (
    <div className="h-screen bg-[#F8F9FB] text-gray-800">
      <div className="h-full flex">
        {/* Left Sidebar */}
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          activeCourse={activeCourse}
          setActiveCourse={setActiveCourse}
          maskMode={maskMode}
        />

        {/* Center Content */}
        <div className="flex-1 h-full flex flex-col overflow-hidden border-x border-gray-100">
          {/* Top Navigation */}
          <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
            <div className="flex items-center gap-8">
              <button
                onClick={() => setActiveTab("Chat")}
                className={`text-sm font-medium transition-colors ${
                  activeTab === "Chat" ? "text-blue-600" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab("Forums")}
                className={`text-sm font-medium transition-colors ${
                  activeTab === "Forums" ? "text-blue-600" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Forums
              </button>
              <button
                onClick={() => setActiveTab("Signals")}
                className={`text-sm font-medium transition-colors ${
                  activeTab === "Signals" ? "text-blue-600" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Signals
              </button>
            </div>

            <div className="relative w-80">
              <input
                placeholder="Search help requests..."
                className="w-full border border-gray-200 rounded-full py-2 px-4 pl-10 text-sm bg-gray-50"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>

          {/* Signals List */}
          <div className="flex-1 overflow-auto px-8 py-6">
            <div className="w-full space-y-4">
              {/* Send Signal Button */}
              <div className="flex items-center gap-3 mb-6 p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400">
                  <Signal className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Send a help signal...</p>
                </div>
              </div>

              {/* Signals */}
              {signals.map((signal) => (
                <div key={signal.id} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-sm transition-shadow">
                  <div className="flex gap-7">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-full ${signal.avatarBg} text-white font-semibold text-lg`}>
                      {signal.avatar}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold">{signal.name}</h3>
                        <span className="inline-flex items-center rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-medium text-cyan-700 border border-cyan-200">
                          {signal.course}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">{signal.message}</p>

                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={14} />
                          {signal.timeLeft}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${signal.progressColor}`} style={{ width: `${signal.progressPercent}%` }} />
                      </div>
                    </div>

                    <div className="text-right text-xs text-gray-500">
                      {signal.timeLeft.split(" ")[0]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Help Request */}
        <aside className="flex h-full w-72 flex-col bg-card/80 p-6 backdrop-blur-sm border-l border-gray-100">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-primary">CIIT University</h2>
            <p className="text-xs text-muted-foreground">Group: Help Center</p>
          </div>

          {/* Profile Card */}
          <div className="mb-6 flex flex-col items-center rounded-3xl bg-gradient-to-b from-background to-card p-6">
            <div className="mb-4 h-24 w-24 rounded-full bg-yellow-300 flex items-center justify-center text-white font-bold text-2xl">
              E
            </div>
            <h3 className="mb-1 text-lg font-semibold text-foreground">Elisabeth May</h3>
            <span className="mb-4 rounded-full bg-cyan-100 px-4 py-1 text-sm font-medium text-cyan-700 border border-cyan-300">
              Student
            </span>
            <span className="text-xs font-medium text-cyan-600">Accounting</span>
          </div>

          {/* Time Remaining */}
          <div className="mb-4 rounded-xl bg-cyan-50 p-4 border border-cyan-200">
            <p className="text-xs font-medium text-cyan-700 mb-1 flex items-center gap-1">
              <Clock size={14} />
              Time Remaining
            </p>
            <p className="text-2xl font-bold text-cyan-700">23h 40m 15s</p>
            <p className="text-xs text-cyan-600 mt-2">Signals expire after 24 hours</p>
          </div>

          {/* Help Request Section */}
          <div className="flex-1 overflow-hidden mb-4">
            <p className="text-sm font-semibold text-foreground mb-2">Help Request:</p>
            <p className="text-sm text-gray-600">
              Hi, I'm struggling with understanding the journal entries for accrued expenses. Can someone help explain the concept and walk me through an example?
            </p>
          </div>

          {/* Request Session Button */}
          <button className="flex w-full items-center justify-center gap-2 rounded-full bg-cyan-500 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-xl hover:shadow-cyan-500/30">
            <Zap className="h-5 w-5" />
            Request a Session
          </button>
        </aside>
      </div>
    </div>
  )
}
