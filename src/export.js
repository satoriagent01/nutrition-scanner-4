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
 * @param {object} mockStorage - Mock storage object for testing
 * @param {string} jsonString - JSON string of data
 * @returns {boolean} Whether import was successful
 */
export function importData(mockStorage, jsonString) {
  try {
    const data = JSON.parse(jsonString);

    if (!data || typeof data !== 'object') {
      return false;
    }

    // Validate structure - at least one of products, mealPlans, or settings should exist
    if (!data.products && !data.mealPlans && !data.settings) {
      return false;
    }

    // Validate products is an array if present
    if (data.products !== undefined && !Array.isArray(data.products)) {
      return false;
    }

    // Validate mealPlans is an array if present
    if (data.mealPlans !== undefined && !Array.isArray(data.mealPlans)) {
      return false;
    }

    // Validate settings is an object if present
    if (data.settings !== undefined && (typeof data.settings !== 'object' || Array.isArray(data.settings))) {
      return false;
    }

    // Clear existing data
    Object.keys(mockStorage).forEach(key => {
      if (key.startsWith('product:') || key.startsWith('mealplan:') || key.startsWith('settings:')) {
        delete mockStorage[key];
      }
    });

    // Save products
    if (data.products && Array.isArray(data.products)) {
      for (const product of data.products) {
        if (product.id) {
          mockStorage[`product:${product.id}`] = JSON.stringify(product);
        }
      }
    }

    // Save meal plans
    if (data.mealPlans && Array.isArray(data.mealPlans)) {
      for (const mealPlan of data.mealPlans) {
        if (mealPlan.id) {
          mockStorage[`mealplan:${mealPlan.id}`] = JSON.stringify(mealPlan);
        }
      }
    }

    // Save settings
    if (data.settings && typeof data.settings === 'object' && !Array.isArray(data.settings)) {
      mockStorage['settings:default'] = JSON.stringify(data.settings);
    }

    return true;
  } catch (e) {
    return false;
  }
}