"use client"

import React, { useState } from "react"
import { Search, Clock, Signal, Zap, Menu, X } from "lucide-react"
import { Sidebar } from "@/app/components/sidebar"

export default function SignalsPage() {
  const [activeNav, setActiveNav] = useState("Home")
  const [activeCourse, setActiveCourse] = useState<string | null>(null)
  const [maskMode] = useState(false)
  const [activeTab, setActiveTab] = useState("Signals")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)

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
    <div className="h-screen bg-[#F8F9FB] text-gray-800 flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Menu Toggle */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h1 className="text-lg font-bold">Signals</h1>
        <button
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {rightPanelOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Left Sidebar - Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40" onClick={() => setSidebarOpen(false)} />
      )}
      
      <div className={`fixed md:static top-0 left-0 h-full w-64 md:w-auto transform transition-transform md:translate-x-0 z-50 md:z-auto ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          activeCourse={activeCourse}
          setActiveCourse={setActiveCourse}
          maskMode={maskMode}
        />
      </div>

      {/* Center Content */}
      <div className="flex-1 h-full flex flex-col overflow-hidden border-x border-gray-100">
        {/* Top Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white border-b border-gray-100 gap-4 sm:gap-0">
          <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("Chat")}
              className={`text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "Chat" ? "text-blue-600" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab("Forums")}
              className={`text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "Forums" ? "text-blue-600" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Forums
            </button>
            <button
              onClick={() => setActiveTab("Signals")}
              className={`text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "Signals" ? "text-blue-600" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Signals
            </button>
          </div>

          <div className="relative w-full sm:w-64 lg:w-80">
            <input
              placeholder="Search help requests..."
              className="w-full border border-gray-200 rounded-full py-2 px-4 pl-10 text-xs sm:text-sm bg-gray-50"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>

        {/* Signals List */}
        <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="w-full space-y-3 sm:space-y-4">
            {/* Send Signal Button */}
            <div className="flex items-center gap-3 mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-gray-100">
              <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-full bg-cyan-400 flex-shrink-0">
                <Signal className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium truncate">Send a help signal...</p>
              </div>
            </div>

            {/* Signals */}
            {signals.map((signal) => (
              <div key={signal.id} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="flex gap-3 sm:gap-7">
                  <div className={`flex h-10 sm:h-14 w-10 sm:w-14 items-center justify-center rounded-full ${signal.avatarBg} text-white font-semibold text-sm sm:text-lg flex-shrink-0`}>
                    {signal.avatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-semibold truncate">{signal.name}</h3>
                      <span className="inline-flex items-center rounded-full bg-cyan-50 px-2 sm:px-2.5 py-0.5 text-xs font-medium text-cyan-700 border border-cyan-200 flex-shrink-0">
                        {signal.course}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-none">{signal.message}</p>

                    <div className="flex items-center gap-2 sm:gap-4 mb-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span className="truncate">{signal.timeLeft}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${signal.progressColor}`} style={{ width: `${signal.progressPercent}%` }} />
                    </div>
                  </div>

                  <div className="text-right text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
                    {signal.timeLeft.split(" ")[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Mobile Overlay */}
      {rightPanelOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40" onClick={() => setRightPanelOpen(false)} />
      )}

      {/* Right Panel - Help Request */}
      <aside className={`fixed md:static top-0 right-0 h-full w-72 flex flex-col bg-card/80 p-4 sm:p-6 backdrop-blur-sm border-l border-gray-100 transform transition-transform md:translate-x-0 z-50 md:z-auto ${
        rightPanelOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        {/* Close Button for Mobile */}
        <button
          onClick={() => setRightPanelOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-4 mt-8 md:mt-0">
          <h2 className="text-base sm:text-lg font-bold text-primary">CIIT University</h2>
          <p className="text-xs text-muted-foreground">Group: Help Center</p>
        </div>

        {/* Profile Card */}
        <div className="mb-4 sm:mb-6 flex flex-col items-center rounded-2xl sm:rounded-3xl bg-gradient-to-b from-background to-card p-4 sm:p-6">
          <div className="mb-4 h-16 sm:h-24 w-16 sm:w-24 rounded-full bg-yellow-300 flex items-center justify-center text-white font-bold text-lg sm:text-2xl">
            E
          </div>
          <h3 className="mb-1 text-sm sm:text-lg font-semibold text-foreground">Elisabeth May</h3>
          <span className="mb-3 sm:mb-4 rounded-full bg-cyan-100 px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium text-cyan-700 border border-cyan-300">
            Student
          </span>
          <span className="text-xs font-medium text-cyan-600">Accounting</span>
        </div>

        {/* Time Remaining */}
        <div className="mb-4 rounded-lg sm:rounded-xl bg-cyan-50 p-3 sm:p-4 border border-cyan-200">
          <p className="text-xs font-medium text-cyan-700 mb-1 flex items-center gap-1">
            <Clock size={14} />
            Time Remaining
          </p>
          <p className="text-xl sm:text-2xl font-bold text-cyan-700">23h 40m 15s</p>
          <p className="text-xs text-cyan-600 mt-2">Signals expire after 24 hours</p>
        </div>

        {/* Help Request Section */}
        <div className="flex-1 overflow-hidden mb-4">
          <p className="text-xs sm:text-sm font-semibold text-foreground mb-2">Help Request:</p>
          <p className="text-xs sm:text-sm text-gray-600">
            Hi, I'm struggling with understanding the journal entries for accrued expenses. Can someone help explain the concept and walk me through an example?
          </p>
        </div>

        {/* Request Session Button */}
        <button className="flex w-full items-center justify-center gap-2 rounded-full bg-cyan-500 px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-xl hover:shadow-cyan-500/30">
          <Zap className="h-4 sm:h-5 w-4 sm:w-5" />
          Request a Session
        </button>
      </aside>
    </div>
  )
}