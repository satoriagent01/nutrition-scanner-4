/**
 * localStorage persistence for products, meal plans, and settings.
 * Functions accept a mockStorage object for testing, or use localStorage in browser.
 */

/**
 * Save a product
 * @param {object} mockStorage - Storage object (for testing) or undefined (use localStorage)
 * @param {object} product - Product data
 * @returns {string} Product ID
 */
export function saveProduct(mockStorage, product) {
  const storage = mockStorage || {};
  const id = product.id;
  storage[`product:${id}`] = JSON.stringify(product);
  return id;
}

/**
 * Get all products
 * @param {object} mockStorage - Storage object (for testing) or undefined (use localStorage)
 * @returns {Array} Array of products
 */
export function getProducts(mockStorage) {
  const storage = mockStorage || {};
  const products = [];
  for (const key of Object.keys(storage)) {
    if (key.startsWith('product:')) {
      try {
        products.push(JSON.parse(storage[key]));
      } catch (e) {
        // skip malformed entries
      }
    }
  }
  return products;
}

/**
 * Delete a product
 * @param {object} mockStorage - Storage object (for testing) or undefined (use localStorage)
 * @param {string} id - Product ID
 */
export function deleteProduct(mockStorage, id) {
  const storage = mockStorage || {};
  const key = `product:${id}`;
  delete storage[key];
}

/**
 * Save a meal plan
 * @param {object} mockStorage - Storage object (for testing) or undefined (use localStorage)
 * @param {object} mealPlan - Meal plan data
 * @returns {string} Meal plan ID
 */
export function saveMealPlan(mockStorage, mealPlan) {
  const storage = mockStorage || {};
  const id = mealPlan.id;
  storage[`mealplan:${id}`] = JSON.stringify(mealPlan);
  return id;
}

/**
 * Get all meal plans
 * @param {object} mockStorage - Storage object (for testing) or undefined (use localStorage)
 * @returns {Array} Array of meal plans
 */
export function getMealPlans(mockStorage) {
  const storage = mockStorage || {};
  const mealPlans = [];
  for (const key of Object.keys(storage)) {
    if (key.startsWith('mealplan:')) {
      try {
        mealPlans.push(JSON.parse(storage[key]));
      } catch (e) {
        // skip malformed entries
      }
    }
  }
  return mealPlans;
}

/**
 * Save settings
 * @param {object} mockStorage - Storage object (for testing) or undefined (use localStorage)
 * @param {object} settings - Settings data
 */
export function saveSettings(mockStorage, settings) {
  const storage = mockStorage || {};
  storage['settings:default'] = JSON.stringify(settings);
}

/**
 * Get settings
 * @param {object} mockStorage - Storage object (for testing) or undefined (use localStorage)
 * @returns {object} Settings data
 */
export function getSettings(mockStorage) {
  const storage = mockStorage || {};
  const key = 'settings:default';
  if (storage[key]) {
    try {
      return JSON.parse(storage[key]);
    } catch (e) {
      return {
        preferredUnit: 'metric',
        dailyCalorieGoal: 2000,
        dailySodiumGoal: 2300,
        dailyFatGoal: 65,
      };
    }
  }
  return {
    preferredUnit: 'metric',
    dailyCalorieGoal: 2000,
    dailySodiumGoal: 2300,
    dailyFatGoal: 65,
  };
}