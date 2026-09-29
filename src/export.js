/**
 * JSON export/import of all user data.
 * Uses localStorage API - only called from browser context.
 */

import { getProducts, getMealPlans, getSettings } from './storage.js';

/**
 * Export all user data as JSON string
 * @returns {string} JSON string of all data
 */
export function exportData() {
  const data = {
    products: getProducts(),
    mealPlans: getMealPlans(),
    settings: getSettings(),
    exportedAt: new Date().toISOString()
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Import user data from JSON string
 * @param {string} jsonString - JSON string of data
 * @returns {boolean} Whether import was successful
 */
export function importData(jsonString) {
  try {
    const data = JSON.parse(jsonString);

    if (!data || typeof data !== 'object') {
      return false;
    }

    // Validate structure - at least one of products, mealPlans, or settings should exist
    if (!data.products && !data.mealPlans && !data.settings) {
      return false;
    }

    // Save products
    if (data.products && typeof data.products === 'object') {
      localStorage.setItem('products', JSON.stringify(data.products));
    }

    // Save meal plans
    if (data.mealPlans && typeof data.mealPlans === 'object') {
      localStorage.setItem('mealPlans', JSON.stringify(data.mealPlans));
    }

    // Save settings
    if (data.settings && typeof data.settings === 'object') {
      localStorage.setItem('settings', JSON.stringify(data.settings));
    }

    return true;
  } catch (e) {
    return false;
  }
}