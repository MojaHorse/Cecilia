const API_BASE = 'https://api.youversion.com/v1';
const API_KEY = import.meta.env.VITE_YV_API_KEY;

const getHeaders = () => ({
  'X-YVP-App-Key': API_KEY,
  'Accept': 'application/json',
});

/**
 * Fetch a list of Bibles for a specific language code (e.g. 'eng', 'sot', 'zul')
 */
export const fetchBibles = async (languageRange = 'eng') => {
  try {
    const url = new URL(`${API_BASE}/bibles`);
    url.searchParams.append('language_ranges[]', languageRange);
    
    const response = await fetch(url.toString(), { headers: getHeaders() });
    
    if (response.status === 204) {
      // 204 means no content available for this query
      return [];
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch bibles: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching bibles:', error);
    throw error;
  }
};

/**
 * Fetch books for a specific Bible ID (e.g. 42 for CPDV)
 */
export const fetchBooks = async (bibleId) => {
  try {
    const response = await fetch(`${API_BASE}/bibles/${bibleId}`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch bible details');
    
    const data = await response.json();
    
    // We get book abbreviations like ['GEN', 'EXO', ...]. 
    return data.books || [];
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

/**
 * Fetch chapters for a specific book in a specific bible.
 */
export const fetchChapters = async (bibleId, bookUSFM) => {
  try {
    const response = await fetch(`${API_BASE}/bibles/${bibleId}/books/${bookUSFM}/chapters`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch chapters for ${bookUSFM}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching chapters:', error);
    throw error;
  }
};

/**
 * Fetch the text content of a specific passage (e.g., JHN.3)
 */
export const fetchPassage = async (bibleId, reference) => {
  try {
    const response = await fetch(`${API_BASE}/bibles/${bibleId}/passages/${reference}?format=html`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch passage ${reference}`);
    }
    
    const data = await response.json();
    return data.data || data; // Contains 'content' (HTML) and 'reference' string
  } catch (error) {
    console.error('Error fetching passage:', error);
    throw error;
  }
};

// Simple mapping of common USFM codes to English names for display
export const BOOK_NAMES = {
  "GEN": "Genesis", "EXO": "Exodus", "LEV": "Leviticus", "NUM": "Numbers", "DEU": "Deuteronomy",
  "JOS": "Joshua", "JDG": "Judges", "RUT": "Ruth", "1SA": "1 Samuel", "2SA": "2 Samuel",
  "1KI": "1 Kings", "2KI": "2 Kings", "1CH": "1 Chronicles", "2CH": "2 Chronicles", "EZR": "Ezra",
  "NEH": "Nehemiah", "TOB": "Tobit", "JDT": "Judith", "EST": "Esther", "1MA": "1 Maccabees",
  "2MA": "2 Maccabees", "JOB": "Job", "PSA": "Psalms", "PRO": "Proverbs", "ECC": "Ecclesiastes",
  "SNG": "Song of Solomon", "WIS": "Wisdom", "SIR": "Sirach", "ISA": "Isaiah", "JER": "Jeremiah",
  "LAM": "Lamentations", "BAR": "Baruch", "EZK": "Ezekiel", "DAN": "Daniel", "HOS": "Hosea",
  "JOL": "Joel", "AMO": "Amos", "OBA": "Obadiah", "JON": "Jonah", "MIC": "Micah", "NAM": "Nahum",
  "HAB": "Habakkuk", "ZEP": "Zephaniah", "HAG": "Haggai", "ZEC": "Zechariah", "MAL": "Malachi",
  "MAT": "Matthew", "MRK": "Mark", "LUK": "Luke", "JHN": "John", "ACT": "Acts", "ROM": "Romans",
  "1CO": "1 Corinthians", "2CO": "2 Corinthians", "GAL": "Galatians", "EPH": "Ephesians",
  "PHP": "Philippians", "COL": "Colossians", "1TH": "1 Thessalonians", "2TH": "2 Thessalonians",
  "1TI": "1 Timothy", "2TI": "2 Timothy", "TIT": "Titus", "PHM": "Philemon", "HEB": "Hebrews",
  "JAS": "James", "1PE": "1 Peter", "2PE": "2 Peter", "1JN": "1 John", "2JN": "2 John",
  "3JN": "3 John", "JUD": "Jude", "REV": "Revelation"
};
