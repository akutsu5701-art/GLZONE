import React, { useRef } from "react";
import { Series, DEFAULT_SERIES } from "@/types";
import { RotateCcw, Plus, Trash2, ChevronDown, ChevronUp, Save, Upload, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeriesEditorProps {
  series: Series[];
  onUpdate: (series: Series[]) => void;
}

const DAYS = [
  { label: "周日", value: 0 },
  { label: "周一", value: 1 },
  { label: "周二", value: 2 },
  { label: "周三", value: 3 },
  { label: "周四", value: 4 },
  { label: "周五", value: 5 },
  { label: "周六", value: 6 },
];

export function SeriesEditor({ series, onUpdate }: SeriesEditorProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(
    series.length > 0 ? series[0].id : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    alert("配置已保存！");
  };

  const handleReset = () => {
    if (window.confirm("重置为默认配置？这将丢弃您的更改。")) {
      onUpdate(DEFAULT_SERIES);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(series, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'series-config.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          // Basic validation could be added here
          onUpdate(parsed);
          alert("配置导入成功！");
        } else {
          alert("无效的配置文件格式");
        }
      } catch (error) {
        console.error("Import error:", error);
        alert("导入失败：文件格式错误");
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again
    event.target.value = '';
  };

  const addSeries = () => {
    const newSeries: Series = {
      id: Date.now().toString(),
      name: "新剧集",
      cpName: "CP名称",
      premiereDate: new Date().toISOString().split("T")[0],
      updateTime: "20:00",
      updateMode: 'interval',
      updateInterval: 1, // Default daily
      updateDays: [],
      episodesPerUpdate: 1,
      totalEpisodes: 12,
    };
    onUpdate([...series, newSeries]);
    setExpandedId(newSeries.id);
  };

  const updateSeries = (id: string, updates: Partial<Series>) => {
    const updated = series.map((s) => (s.id === id ? { ...s, ...updates } : s));
    onUpdate(updated);
  };

  const deleteSeries = (id: string) => {
    if (window.confirm("删除此剧集？")) {
      onUpdate(series.filter((s) => s.id !== id));
    }
  };

  const toggleDay = (seriesId: string, currentDays: number[] | undefined, day: number) => {
    const days = currentDays || [];
    const newDays = days.includes(day)
      ? days.filter((d) => d !== day)
      : [...days, day].sort((a, b) => a - b);
    updateSeries(seriesId, { updateDays: newDays });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-400">配置</h2>
        <div className="flex gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportFile} 
            className="hidden" 
            accept=".json"
          />
          <button
            onClick={handleImportClick}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="导入配置"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="导出配置"
          >
            <Download className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
          <button
            onClick={addSeries}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加
          </button>
          <button
            onClick={handleSave}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="保存配置"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="重置为默认"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {series.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            暂无剧集。点击“添加”开始追踪。
          </div>
        )}

        {series.map((s) => {
          const isExpanded = expandedId === s.id;
          return (
            <div
              key={s.id}
              className={cn(
                "border rounded-lg transition-all duration-200",
                isExpanded ? "border-blue-200 shadow-sm bg-white" : "border-gray-200 hover:border-blue-200 bg-gray-50"
              )}
            >
              <div
                className="flex items-center justify-between p-3 cursor-pointer select-none"
                onClick={() => setExpandedId(isExpanded ? null : s.id)}
              >
                <div className="flex items-center gap-3 overflow-hidden flex-1 mr-2">
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-gray-500 truncate text-sm">{s.name}</span>
                    {!isExpanded && (
                      <span className="text-xs text-gray-400 truncate">
                        {s.updateMode === 'weekly' 
                          ? (s.updateDays && s.updateDays.length > 0 
                              ? s.updateDays.map(d => DAYS.find(day => day.value === d)?.label).join(", ") 
                              : "未设置更新日")
                          : (s.updateInterval === 1 ? "每天更新" : `每${s.updateInterval}天更新`)
                        }
                        {s.episodesPerUpdate > 1 ? ` (${s.episodesPerUpdate}集)` : ""}
                        {' • '}{s.updateTime}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 border-t border-gray-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-400">剧名</label>
                      <input
                        type="text"
                        value={s.name}
                        onChange={(e) => updateSeries(s.id, { name: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm text-gray-500 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-400">CP名称</label>
                      <input
                        type="text"
                        value={s.cpName}
                        onChange={(e) => updateSeries(s.id, { cpName: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm text-gray-500 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Schedule Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-400">首播日期</label>
                      <input
                        type="date"
                        value={s.premiereDate}
                        onChange={(e) => updateSeries(s.id, { premiereDate: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm text-gray-500 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-400">更新时间</label>
                      <input
                        type="time"
                        value={s.updateTime}
                        onChange={(e) => updateSeries(s.id, { updateTime: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm text-gray-500 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-400">总集数</label>
                    <input
                      type="number"
                      min="1"
                      value={s.totalEpisodes}
                      onChange={(e) => updateSeries(s.id, { totalEpisodes: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 text-sm text-gray-500 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Update Mode Selection */}
                  <div className="space-y-2 pt-2 border-t border-gray-50">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-400 cursor-pointer">
                        <input
                          type="radio"
                          name={`mode-${s.id}`}
                          checked={s.updateMode !== 'weekly'} // Default to interval if undefined
                          onChange={() => updateSeries(s.id, { updateMode: 'interval' })}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        按间隔更新
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-400 cursor-pointer">
                        <input
                          type="radio"
                          name={`mode-${s.id}`}
                          checked={s.updateMode === 'weekly'}
                          onChange={() => updateSeries(s.id, { updateMode: 'weekly' })}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        按星期更新
                      </label>
                    </div>

                    {s.updateMode === 'weekly' ? (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <label className="text-xs font-medium text-gray-400">选择更新日</label>
                        <div className="flex justify-between gap-1">
                          {DAYS.map((day) => {
                            const isSelected = (s.updateDays || []).includes(day.value);
                            return (
                              <button
                                key={day.value}
                                onClick={() => toggleDay(s.id, s.updateDays, day.value)}
                                className={cn(
                                  "flex-1 py-1.5 text-xs font-medium rounded transition-colors",
                                  isSelected
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                )}
                              >
                                {day.label.slice(0, 1)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                        <label className="text-xs font-medium text-gray-400">更新间隔 (天)</label>
                        <input
                          type="number"
                          min="1"
                          value={s.updateInterval}
                          onChange={(e) => updateSeries(s.id, { updateInterval: parseInt(e.target.value) || 1 })}
                          className="w-full px-2 py-1.5 text-sm text-gray-500 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="例如: 1 (每天), 7 (每周)"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-400">每更集数</label>
                    <input
                      type="number"
                      min="1"
                      value={s.episodesPerUpdate}
                      onChange={(e) => updateSeries(s.id, { episodesPerUpdate: parseInt(e.target.value) || 1 })}
                      className="w-full px-2 py-1.5 text-sm text-gray-500 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => deleteSeries(s.id)}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      删除剧集
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
