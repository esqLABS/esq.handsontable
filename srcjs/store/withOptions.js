import React from "react";
import { useOptions } from "./useOptions";

/**
 * Higher-Order Component that injects options from the store into a component
 *
 * @param {string} tableKey - Unique identifier for the table
 * @param {Object} defaults - Default options to use if store is empty
 * @returns {Function} HOC that wraps the component
 *
 * @example
 * const MyTableWithOptions = withOptions("myTable", {
 *   categories: [],
 *   statuses: ["active", "inactive"]
 * })(MyTable);
 *
 * // In MyTable component:
 * function MyTable({ categories, statuses, ...otherProps }) {
 *   // categories and statuses come from store or defaults
 * }
 */
export const withOptions = (tableKey, defaults = {}) => (Component) => (props) => {
  const injected = useOptions(tableKey) || {};
  // defaults first, then injected store values, then explicit props from parent (parent wins)
  return <Component {...defaults} {...injected} {...props} />;
};
