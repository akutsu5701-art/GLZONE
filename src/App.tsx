import React, { useState, useMemo, useEffect } from "react";
import { Calendar } from "./components/Calendar";
import { SeriesEditor } from "./components/SeriesEditor";
import { generateEpisodes } from "./lib/schedule";
import { DEFAULT_SERIES, Series } from "./types";
import { CalendarDays } from "lucide-react";

export default function App() {
  const [seriesList, setSeriesList] = useState<Series[]>(() => {
    try {
      const saved = localStorage.getItem("series-calendar-data");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migration: Ensure new fields exist
        return parsed.map((s: any) => ({
          ...s,
          updateInterval: s.updateInterval || 1,
          episodesPerUpdate: s.episodesPerUpdate || 1,
          // Remove old field if exists
          updateDays: undefined
        }));
      }
      return DEFAULT_SERIES;
    } catch (e) {
      console.error("Failed to load data", e);
      return DEFAULT_SERIES;
    }
  });

  useEffect(() => {
    localStorage.setItem("series-calendar-data", JSON.stringify(seriesList));
  }, [seriesList]);

  const episodes = useMemo(() => {
    return generateEpisodes(seriesList);
  }, [seriesList]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              追剧日历 <span className="text-blue-600 font-mono text-sm bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">GLZONE</span>
            </h1>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block font-medium">
            轻松追踪你喜爱的剧集
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Calendar (takes 2/3 space on large screens) */}
        <div className="lg:col-span-2 h-[600px] lg:h-[800px]">
          <Calendar episodes={episodes} />
        </div>

        {/* Right Column: Editor (takes 1/3 space) */}
        <div className="h-[400px] lg:h-[800px]">
          <SeriesEditor series={seriesList} onUpdate={setSeriesList} />
        </div>
      </main>
    </div>
  );
}
