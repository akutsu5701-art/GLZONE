import React, { useState, useRef } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Episode } from "@/types";
import html2canvas from "html2canvas";

interface CalendarProps {
  episodes: Episode[];
}

const COLORS = {
  white: "#ffffff",
  black: "#000000",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",
  blue50: "#eff6ff",
  blue100: "#dbeafe",
  blue200: "#bfdbfe",
  blue600: "#2563eb",
  blue800: "#1e40af",
  blue900: "#1e3a8a",
};

export function Calendar({ episodes }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEpisodes, setSelectedEpisodes] = useState<Episode[] | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: zhCN, weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { locale: zhCN, weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getEpisodesForDay = (day: Date) => {
    return episodes.filter((ep) => isSameDay(ep.date, day));
  };

  const groupEpisodesBySeries = (dayEpisodes: Episode[]) => {
    const groups: { [key: string]: Episode[] } = {};
    dayEpisodes.forEach(ep => {
      if (!groups[ep.seriesId]) {
        groups[ep.seriesId] = [];
      }
      groups[ep.seriesId].push(ep);
    });
    return Object.values(groups);
  };

  const handleDownload = async () => {
    if (!calendarRef.current || isDownloading) return;

    setIsDownloading(true);

    try {
      // 1. Clone the element
      const element = calendarRef.current;
      const clone = element.cloneNode(true) as HTMLElement;

      // 2. Style the clone to show full content
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      
      clone.style.position = "fixed";
      clone.style.top = "0";
      clone.style.left = "0";
      clone.style.zIndex = "-1000";
      clone.style.width = `${width}px`;
      clone.style.height = `${height}px`; // Use full height
      clone.style.overflow = "visible";
      clone.style.backgroundColor = COLORS.white;
      
      // Ensure font inheritance
      clone.style.fontFamily = getComputedStyle(element).fontFamily;

      // 3. Append to body
      document.body.appendChild(clone);

      // Wait for rendering
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 4. Capture
      const canvas = await html2canvas(clone, {
        scale: 2, // Higher resolution
        useCORS: true,
        backgroundColor: COLORS.white,
        logging: false,
        windowWidth: width,
        height: height,
      });

      // 5. Cleanup
      document.body.removeChild(clone);

      // 6. Download
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `泰百日历-${format(currentMonth, "yyyy-MM")}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download calendar:", error);
      alert("下载失败，请重试。如果问题持续，请尝试使用截图工具。");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Controls Toolbar (Not exported) */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="flex space-x-2">
            <button
              onClick={prevMonth}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="上个月"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="下个月"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <span className="text-sm font-medium text-gray-500">
            {format(currentMonth, "yyyy年 MMMM", { locale: zhCN })}
          </span>
        </div>
        
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
        >
          {isDownloading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>保存图片</span>
        </button>
      </div>

      {/* Scrollable Preview Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start">
        {/* Export Target (The "Poster") */}
        <div 
          ref={calendarRef}
          id="calendar-export-root"
          className="bg-white p-8 shadow-2xl w-fit mx-auto border-[16px] border-white"
          style={{ 
            minHeight: '800px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
          }}
        >
          {/* Poster Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black tracking-tight text-blue-900 mb-2">
              泰百{format(currentMonth, "yyyy年M月")}
            </h2>
            <div className="w-16 h-1 bg-blue-500 mx-auto rounded-full opacity-50"></div>
          </div>

      {/* Calendar Grid (Dynamic Column Grid Layout) */}
      <div 
        className="flex flex-col relative z-10 border-2 border-black bg-white"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='300' height='300' viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' fill='%232563eb' fill-opacity='0.03' font-family='Inter, sans-serif' font-weight='900' font-size='40' text-anchor='middle' dominant-baseline='middle' transform='rotate(-30 150 150)'%3EGLZONE%3C/text%3E%3C/svg%3E")`,
        }}
      >
        {(() => {
          // Calculate which columns have episodes
          const columnsWithEpisodes = new Set<number>();
          calendarDays.forEach(day => {
            if (getEpisodesForDay(day).length > 0) {
              columnsWithEpisodes.add(day.getDay());
            }
          });

          // Generate grid-template-columns
          // 0=Sunday, 1=Monday, ...
          // If column has episodes: 200px (fixed width)
          // If not: 80px (fixed width)
          // This ensures the background box shrinks/expands to fit the content exactly.
          const gridTemplateColumns = Array.from({ length: 7 }).map((_, i) => {
            return columnsWithEpisodes.has(i) ? "200px" : "80px";
          }).join(" ");

          return (
            <>
              {/* Days Header */}
              <div 
                className="grid border-b-2 border-black bg-blue-50"
                style={{ gridTemplateColumns }}
              >
                {weekDays.map((day, i) => (
                  <div
                    key={day}
                    className={cn(
                      "py-2 text-center text-sm font-bold text-blue-600 border-r border-black last:border-r-0",
                      !columnsWithEpisodes.has(i) && "text-gray-400 font-normal"
                    )}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid Cells */}
              <div 
                className="grid auto-rows-fr"
                style={{ gridTemplateColumns }}
              >
                {calendarDays.map((day, dayIdx) => {
                  const dayEpisodes = getEpisodesForDay(day);
                  const groupedEpisodes = groupEpisodesBySeries(dayEpisodes);
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const hasEpisodes = groupedEpisodes.length > 0;
                  
                  return (
                    <div
                      key={day.toString()}
                      className={cn(
                        "min-h-[8rem] p-2 border-b border-r border-black flex flex-col gap-2 relative",
                        (dayIdx + 1) % 7 === 0 && "border-r-0", // Remove right border for last column
                        !isCurrentMonth && "bg-gray-50/30"
                      )}
                    >
                      {/* Date Number */}
                      <div className="flex items-baseline gap-1">
                        <span
                          className={cn(
                            "text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full",
                            isSameDay(day, new Date()) 
                              ? "bg-blue-600 text-white" 
                              : "text-gray-700"
                          )}
                        >
                          {format(day, "d")}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {format(day, "EEE", { locale: zhCN })}
                        </span>
                      </div>

                      {/* Episodes List */}
                      <div className="flex flex-col gap-2 flex-1">
                        {groupedEpisodes.map((group) => {
                          const firstEp = group[0];
                          const episodeNumbers = group.map(e => e.episodeNumber).join(", ");
                          
                          return (
                            <button
                              key={`${firstEp.seriesId}-${firstEp.episodeNumber}`}
                              onClick={() => setSelectedEpisodes(group)}
                              className="text-left w-full group/card bg-white border border-blue-200 hover:border-blue-400 transition-colors shadow-sm"
                            >
                              <div className="flex items-baseline gap-2 px-1.5 py-1 border-b border-blue-100">
                                <span className="font-bold text-blue-900 text-[11px] leading-tight whitespace-nowrap">
                                  {firstEp.seriesName}
                                </span>
                                {firstEp.cpName && (
                                  <span className="text-[10px] text-blue-600/80 leading-tight truncate">
                                    {firstEp.cpName}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 px-1.5 py-1 text-[10px] font-medium text-blue-800 bg-blue-50/30">
                                <span className="bg-blue-100/50 px-1 rounded text-blue-600">Ep {episodeNumbers}</span>
                                <span>{firstEp.time}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          );
        })()}
      </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEpisodes && selectedEpisodes.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setSelectedEpisodes(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {selectedEpisodes[0].seriesName}
            </h3>
            <p className="text-sm text-gray-500 mb-4">{selectedEpisodes[0].cpName}</p>
            
            <div className="space-y-4">
              {selectedEpisodes.map((ep) => (
                <div key={ep.episodeNumber} className="space-y-2 border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">集数</span>
                    <span className="text-lg font-bold text-gray-900">
                      #{ep.episodeNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <span className="text-xs text-gray-500">日期</span>
                    <span className="text-xs font-medium text-gray-700">
                      {format(ep.date, "yyyy年M月d日 EEEE", { locale: zhCN })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <span className="text-xs text-gray-500">时间</span>
                    <span className="text-xs font-medium text-gray-700">
                      {ep.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
