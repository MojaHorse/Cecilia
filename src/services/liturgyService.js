import { getHymnsByLanguage } from '../data/hymnsService';

/**
 * Calculates the Liturgical Year (A, B, C) and Cycle (I, II)
 * @param {Date} date - Optional Date object (defaults to today)
 */
export function getLiturgicalYear(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed (11 = December)
  
  // Liturgical year roughly starts on the 1st Sunday of Advent.
  // For simplicity, we assume late Nov/December starts the new liturgical year.
  let liturgicalYear = year;
  if (month === 11 || (month === 10 && date.getDate() >= 27)) {
    liturgicalYear = year + 1;
  }
  
  // Year A = 2023, 2026, 2029
  // Year B = 2024, 2027, 2030
  // Year C = 2025, 2028, 2031
  const mod = liturgicalYear % 3;
  let yearABC = 'A';
  if (mod === 2) yearABC = 'B';
  if (mod === 0) yearABC = 'C';

  // Cycle I/II (Weekdays)
  // Odd years are Cycle I, Even years are Cycle II
  const cycle = (liturgicalYear % 2 === 1) ? 'I' : 'II';

  return {
    year: yearABC,
    cycle: cycle,
    liturgicalYear: liturgicalYear
  };
}

/**
 * Returns a "Hymn of the Day" using the day of the year as a stable seed
 * @param {string} lang - The language to select from
 */
export function getDailyHymn(lang = 'sesotho') {
  const hymns = getHymnsByLanguage(lang);
  if (!hymns || hymns.length === 0) return null;
  
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Use day of year to deterministically select a hymn index
  const index = dayOfYear % hymns.length;
  return hymns[index];
}

/**
 * Fetches today's liturgical info (Season, Week, Color, Feasts)
 * Falls back to a default "Ordinary Time" if the API is unreachable
 */
export async function fetchTodayLiturgy() {
  try {
    // Note: calapi is HTTP only
    const res = await fetch('http://calapi.inadiutorium.cz/api/v0/en/calendars/default/today');
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    
    // The first celebration is usually the highest ranking one for the day
    const celebration = data.celebrations && data.celebrations.length > 0 ? data.celebrations[0] : null;
    
    return {
      season: data.season, // 'ordinary', 'advent', 'lent', 'easter', 'christmas'
      week: data.season_week,
      title: celebration ? celebration.title : '',
      colour: celebration ? celebration.colour : 'green',
      weekday: data.weekday,
      date: data.date
    };
  } catch (error) {
    console.error("Failed to fetch liturgy", error);
    // Graceful fallback
    return {
      season: 'ordinary',
      week: '',
      title: 'Ordinary Time',
      colour: 'green',
      weekday: new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
      date: new Date().toISOString().split('T')[0]
    };
  }
}
