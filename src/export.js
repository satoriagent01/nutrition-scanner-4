/**
 * JSON export/import of all user data.
 * Uses localStorage API - only called from browser context.
 */

import { getProducts, getMealPlans, getSettings } from './storage.js';

/**
 * Export all user data as JSON string
 * @param {object} mockStorage - Optional mock storage object for testing
 * @returns {string} JSON string of all data
 */
export function exportData(mockStorage) {
  const products = getProducts(mockStorage);
  const mealPlans = getMealPlans(mockStorage);
  const settings = getSettings(mockStorage);

  const data = {
    products,
    mealPlans,
    settings,
    exportedAt: new Date().toISOString()
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Import user data from JSON string
 * @param {string} jsonString - JSON string of data
 * @param {object} mockStorage - Optional mock storage object for testing
 * @returns {boolean} Whether import was successful
 */
export function importData(jsonString, mockStorage) {
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
      if (mockStorage) {
        mockStorage['products'] = JSON.stringify(data.products);
      } else {
        localStorage.setItem('products', JSON.stringify(data.products));
      }
    }

    // Save meal plans
    if (data.mealPlans && typeof data.mealPlans === 'object') {
      if (mockStorage) {
        mockStorage['mealPlans'] = JSON.stringify(data.mealPlans);
      } else {
        localStorage.setItem('mealPlans', JSON.stringify(data.mealPlans));
      }
    }

    // Save settings
    if (data.settings && typeof data.settings === 'object') {
      if (mockStorage) {
        mockStorage['settings'] = JSON.stringify(data.settings);
      } else {
        localStorage.setItem('settings', JSON.stringify(data.settings));
      }
    }

    return true;
  } catch (e) {
    return false;
  }
}