/**
 * Data transformation utilities for esq.handsontable
 */

/**
 * Validates and normalizes R vector input to JavaScript array
 * @param {*} input - Input from R (could be string, array, or other)
 * @returns {Array} Normalized array
 */
export function validateVectorInputR(input) {
  if (typeof input === 'string' && input.length === 0) {
    return [];
  } else if (typeof input === 'string') {
    return [input];
  } else if (Array.isArray(input)) {
    return input;
  } else {
    return [];
  }
}

/**
 * Split a CSV-like string on commas **outside** double quotes.
 * Preserves quoted strings intact and trims whitespace.
 *
 * @example
 * splitOutsideQuotes('Global, Joe')           // ['Global', 'Joe']
 * splitOutsideQuotes('Global, "Hi, I am Joe"') // ['Global', '"Hi, I am Joe"']
 *
 * @param {string} str - Comma-separated string, may include quoted parts
 * @returns {string[]} Tokens split on top-level commas
 */
export function splitOutsideQuotes(str) {
  const out = [];
  let cur = '';
  let inside = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '"') {
      inside = !inside;
      cur += ch;
    } else if (ch === ',' && !inside) {
      const t = cur.trim();
      if (t) out.push(t);
      cur = '';
    } else {
      cur += ch;
    }
  }
  const last = cur.trim();
  if (last) out.push(last);
  return out;
}

/**
 * Wraps array items in double quotes if not already quoted
 * @param {Array} input - Array of strings
 * @returns {Array} Array with quoted strings
 */
export function wrapIntoQuotes(input) {
  return input
    .filter(item => item != null && String(item).trim() !== "")
    .map(item => {
      const str = String(item).trim();
      return /^".*"$/.test(str) ? str : `"${str}"`;
    });
}

/**
 * Wraps object keys in double quotes if not already quoted
 * @param {Object} obj - Object to transform
 * @returns {Object} Object with quoted keys
 */
export function wrapObjectKeysIntoQuotes(obj) {
  if (obj == null || typeof obj !== "object") {
    throw new TypeError("Input must be a non-null object");
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      const trimmedKey = key.trim();
      const newKey = /^".*"$/.test(trimmedKey) ? trimmedKey : `"${trimmedKey}"`;
      return [newKey, value];
    })
  );
}

/**
 * Decodes base64-encoded UTF-8 JSON string (from Shiny)
 * @param {string} base64 - Base64 encoded string
 * @returns {*} Parsed JSON object
 */
export function base64ToUtf8Json(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const utf8Decoder = new TextDecoder("utf-8");
  const jsonString = utf8Decoder.decode(bytes);
  return JSON.parse(jsonString);
}

/**
 * Decodes HTML entities in a string
 * @param {string} str - String with HTML entities
 * @returns {string} Decoded string
 */
export function decodeHtmlEntities(str) {
  if (typeof str !== "string") return str;
  const el = document.createElement("textarea");
  el.innerHTML = str;
  return el.value;
}

/**
 * Processes data received from Shiny for use in Handsontable
 * Converts string representations of arrays back to actual arrays
 *
 * @param {Array} data - Array of row objects from Shiny
 * @param {Array<string>} arrayColumns - Column names that should be converted to arrays
 * @returns {Array} Processed data with array columns converted
 */
export function processShinyData(data, arrayColumns = []) {
  if (!data || !Array.isArray(data)) return data;

  return data.map(row => {
    const newRow = { ...row };
    arrayColumns.forEach(col => {
      if (newRow[col] && typeof newRow[col] === 'string') {
        newRow[col] = splitOutsideQuotes(newRow[col]);
      }
    });
    return newRow;
  });
}

/**
 * Prepares data for sending to Shiny
 * Converts arrays back to comma-separated strings and handles null values
 *
 * @param {Array} data - Array of row objects
 * @param {Array<string>} arrayColumns - Column names that contain arrays to join
 * @returns {Array} Data ready for Shiny
 */
export function prepareShinyData(data, arrayColumns = []) {
  if (!data || !Array.isArray(data)) return data;

  return data.map(row => {
    const newRow = { ...row };

    // Convert arrays to comma-separated strings
    arrayColumns.forEach(col => {
      if (Array.isArray(newRow[col])) {
        newRow[col] = newRow[col].length > 0 ? newRow[col].join(", ") : null;
      }
    });

    // Normalise empty values to null for clean R-side handling
    Object.keys(newRow).forEach(key => {
      if (newRow[key] === '' || newRow[key] === undefined) {
        newRow[key] = null;
      }
      if (Array.isArray(newRow[key]) && newRow[key].length === 0) {
        newRow[key] = null;
      }
    });

    return newRow;
  });
}
