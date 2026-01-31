"use client"

import React, { useState } from "react"
import { Search, Clock, ClockAlert, MoreVertical, Edit2, Trash2 } from "lucide-react"
import { Sidebar } from "@/components/sidebar"

export default function SignalsPage() {
  const [activeNav, setActiveNav] = useState("Home")
  const [activeCourse, setActiveCourse] = useState<string | null>(null)
  const [maskMode] = useState(false)
  const [activeTab, setActiveTab] = useState("Signals")
  
  // State to track which dropdown is open
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

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
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          activeCourse={activeCourse}
          setActiveCourse={setActiveCourse}
          maskMode={maskMode}
        />

        <div className="flex-1 h-full flex flex-col overflow-hidden border-x border-gray-100">
          <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
            <div className="flex items-center gap-8">
              {["Chat", "Forums", "Signals"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === tab ? "text-blue-600" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-80">
              <input
                placeholder="Search help requests..."
                className="w-full border border-gray-200 rounded-full py-2 px-4 pl-10 text-sm bg-gray-50 focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>

          <div className="flex-1 overflow-auto px-8 py-6">
            <div className="w-full space-y-4">
              <div className="flex items-center gap-3 mb-6 p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400">
                  <ClockAlert className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Send a help signal...</p>
                </div>
              </div>

              {signals.map((signal) => (
                <div key={signal.id} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-sm transition-shadow">
                  <div className="flex gap-7">
                    <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${signal.avatarBg} text-white font-semibold text-lg`}>
                      {signal.avatar}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold">{signal.name}</h3>
                        <span className="inline-flex items-center rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-medium text-cyan-700 border border-cyan-200">
                          {signal.course}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 mb-3 leading-relaxed">{signal.message}</p>

                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={14} />
                          {signal.timeLeft}
                        </div>
                      </div>

                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${signal.progressColor}`} style={{ width: `${signal.progressPercent}%` }} />
                      </div>
                    </div>

                    {/* Action Column */}
                    <div className="relative flex flex-col items-end gap-1 min-w-[80px]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">
                          {signal.timeLeft.split(" ")[0]}
                        </span>
                        
                        {/* Edit/Delete Toggle Button */}
                        <div className="relative">
                          <button 
                            onClick={() => setOpenMenuId(openMenuId === signal.id ? null : signal.id)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {/* Dropdown Menu */}
                          {openMenuId === signal.id && (
                            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-10">
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                                <Edit2 size={12} /> Edit
                              </button>
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50">
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}