import { useSyncExternalStore } from "react";
import { getOptions, subscribeOptions } from "./optionsStore";

/**
 * React hook to access options for a specific table from the store
 * Automatically re-renders when store changes
 *
 * @param {string} tableKey - Unique identifier for the table
 * @returns {Object} Options for the specified table
 *
 * @example
 * function MyTable({ tableKey }) {
 *   const options = useOptions(tableKey);
 *   // options.dropdownA, options.dropdownB, etc.
 * }
 */
export function useOptions(tableKey) {
  const snapshot = useSyncExternalStore(
    subscribeOptions,
    getOptions,
    getOptions
  );
  return (snapshot && snapshot[tableKey]) || {};
}

/**
 * React hook to access a specific option from the store
 *
 * @param {string} tableKey - Unique identifier for the table
 * @param {string} optionKey - Key of the specific option
 * @returns {*} The option value or undefined
 *
 * @example
 * function MyDropdown({ tableKey }) {
 *   const categories = useOption(tableKey, 'categories');
 *   // categories is the array of dropdown options
 * }
 */
export function useOption(tableKey, optionKey) {
  const options = useOptions(tableKey);
  return options[optionKey];
}
