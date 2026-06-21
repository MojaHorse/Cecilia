import localforage from 'localforage';

// Initialize the IndexedDB store
localforage.config({
  name: 'TheGoodShepherd',
  storeName: 'bible_cache', // Should be alphanumeric, with underscores.
  description: 'Robust caching system for Bible text and offline data'
});

/**
 * Get data from cache. Checks TTL to ensure data is still fresh.
 * @param {string} key - Unique cache key
 * @returns {Promise<any | null>} Returns null if cache miss or expired.
 */
export const getCachedData = async (key) => {
  try {
    const item = await localforage.getItem(key);
    if (!item) return null;

    // Check expiration
    if (item.expiry && Date.now() > item.expiry) {
      // Data is expired, delete it and return null
      await localforage.removeItem(key);
      return null;
    }

    return item.value;
  } catch (err) {
    console.error(`Cache Read Error for key [${key}]:`, err);
    return null;
  }
};

/**
 * Save data to cache with optional TTL.
 * @param {string} key - Unique cache key
 * @param {any} value - Data to store
 * @param {number} ttlDays - Time to live in days. Default is 30 days.
 */
export const setCachedData = async (key, value, ttlDays = 30) => {
  try {
    const item = {
      value,
      expiry: Date.now() + (ttlDays * 24 * 60 * 60 * 1000)
    };
    await localforage.setItem(key, item);
  } catch (err) {
    console.error(`Cache Write Error for key [${key}]:`, err);
  }
};
