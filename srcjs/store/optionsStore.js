/**
 * Simple reactive store for dropdown options
 * Allows dynamic updates from Shiny without re-rendering the entire table
 */

let state = {}; // { [tableKey]: { ...options } }
const listeners = new Set();

/**
 * Set options for a specific table
 * @param {string} tableKey - Unique identifier for the table
 * @param {Object} nextOptions - Options to merge into the table's state
 */
export function setOptions(tableKey, nextOptions) {
  state = {
    ...state,
    [tableKey]: { ...(state[tableKey] || {}), ...nextOptions }
  };
  listeners.forEach(l => l());
}

/**
 * Get all options from the store
 * @returns {Object} Full store state
 */
export function getOptions() {
  return state;
}

/**
 * Get options for a specific table
 * @param {string} tableKey - Unique identifier for the table
 * @returns {Object} Options for the specified table
 */
export function getTableOptions(tableKey) {
  return state[tableKey] || {};
}

/**
 * Subscribe to store changes
 * @param {Function} listener - Callback function called on state changes
 * @returns {Function} Unsubscribe function
 */
export function subscribeOptions(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Clear all options in the store
 */
export function clearOptions() {
  state = {};
  listeners.forEach(l => l());
}

/**
 * Clear options for a specific table
 * @param {string} tableKey - Unique identifier for the table
 */
export function clearTableOptions(tableKey) {
  if (state[tableKey]) {
    const { [tableKey]: removed, ...rest } = state;
    state = rest;
    listeners.forEach(l => l());
  }
}
