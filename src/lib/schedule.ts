import { Series, Episode } from "../types";
import { addDays, parseISO, getDay } from "date-fns";

export function generateEpisodes(seriesList: Series[]): Episode[] {
  const allEpisodes: Episode[] = [];

  seriesList.forEach((series) => {
    if (!series.premiereDate || series.totalEpisodes <= 0) return;

    let currentDate = parseISO(series.premiereDate);
    let episodeCount = 1;

    // Safety break to prevent infinite loops
    const MAX_DAYS_LOOKAHEAD = 365 * 2; // 2 years
    let daysChecked = 0;

    while (episodeCount <= series.totalEpisodes && daysChecked < MAX_DAYS_LOOKAHEAD) {
      let shouldUpdate = false;

      if (series.updateMode === 'weekly') {
        // Weekly mode: check if current day of week is in updateDays
        // Note: getDay returns 0 for Sunday, 1 for Monday...
        const dayOfWeek = getDay(currentDate);
        if (series.updateDays && series.updateDays.includes(dayOfWeek)) {
          shouldUpdate = true;
        }
      } else {
        // Interval mode: always update on the calculated date
        // The loop logic handles the interval jump at the end
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        // Add episodes for the current update day
        for (let i = 0; i < series.episodesPerUpdate && episodeCount <= series.totalEpisodes; i++) {
          allEpisodes.push({
            seriesId: series.id,
            seriesName: series.name,
            cpName: series.cpName,
            episodeNumber: episodeCount,
            date: currentDate,
            time: series.updateTime,
          });
          episodeCount++;
        }
      }

      // Advance to the next date
      if (series.updateMode === 'weekly') {
        // In weekly mode, we check day by day
        currentDate = addDays(currentDate, 1);
        daysChecked++;
      } else {
        // In interval mode, we jump by interval
        // If updateInterval is invalid, default to 1 to avoid infinite loop
        const interval = Math.max(1, series.updateInterval || 1);
        currentDate = addDays(currentDate, interval);
        // daysChecked += interval; // Not strictly necessary for interval mode but good for consistency
      }
    }
  });

  return allEpisodes;
}
