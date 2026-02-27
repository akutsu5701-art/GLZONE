export interface Series {
  id: string;
  name: string;
  cpName: string;
  premiereDate: string; // YYYY-MM-DD
  updateTime: string; // HH:mm
  updateMode: 'interval' | 'weekly'; // New field
  updateInterval: number; // Used when mode is 'interval'
  updateDays: number[]; // Used when mode is 'weekly' (0=Sun, 1=Mon...)
  episodesPerUpdate: number; // Number of episodes released per update
  totalEpisodes: number;
}

export interface Episode {
  seriesId: string;
  seriesName: string;
  cpName: string;
  episodeNumber: number;
  date: Date;
  time: string;
}

export const DEFAULT_SERIES: Series[] = [
  {
    id: "1",
    name: "示例剧集",
    cpName: "主CP",
    premiereDate: new Date().toISOString().split('T')[0],
    updateTime: "20:00",
    updateMode: 'interval',
    updateInterval: 1, // Daily
    updateDays: [],
    episodesPerUpdate: 1,
    totalEpisodes: 12,
  },
  {
    id: "2",
    name: "周末剧场",
    cpName: "副CP",
    premiereDate: new Date().toISOString().split('T')[0],
    updateTime: "22:00",
    updateMode: 'weekly',
    updateInterval: 1,
    updateDays: [0, 6], // Sat, Sun
    episodesPerUpdate: 1,
    totalEpisodes: 8,
  }
];
