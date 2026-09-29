/**
 * localStorage persistence for products, meal plans, and settings.
 * Functions accept a mockStorage object for testing, or use localStorage in browser.
 */

const STORAGE_KEYS = {
  PRODUCTS: 'products',
  MEAL_PLANS: 'mealPlans',
  SETTINGS: 'settings'
};

/**
 * Generate a unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Save a product
 * @param {object} mockStorage - Storage object (for testing) or undefined (use localStorage)
 * @param {object} product - Product data
 * @returns {string} Product ID
 */
export function saveProduct(mockStorage, product) {
  const storage = mockStorage || {};
  const products = getProducts(mockStorage);
  const id = product.id || generateId();
  const productData = {
    id,
    name: product.name,
    servingSize: product.servingSize,
    servingUnit: product.servingUnit,
    nutrients: product.nutrients,
    createdAt: product.createdAt || new Date().toISOString()
  };

  storage[`product:${id}`] = JSON.stringify(productData);
  if (!mockStorage) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(storage));
  }
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
 * Get a single product by ID
 * @param {object} mockStorage - Storage object (for testing) or undefined (use localStorage)
 * @param {string} id - Product ID
 * @returns {object|null} Product data or null
 */
export function getProduct(mockStorage, id) {
  const storage = mockStorage || {};
  const key = `product:${id}`;
  if (storage[key]) {
    try {
      return JSON.parse(storage[key]);
    } catch (e) {
      return null;
    }
  }
  return null;
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
  if (!mockStorage) {
    const products = getProducts();
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }
}

/**
 * Save a meal plan
 * @param {object} mockStorage - Storage object (for testing) or undefined (use localStorage)
 * @param {object} mealPlan - Meal plan data
 * @returns {string} Meal plan ID
 */
export function saveMealPlan(mockStorage, mealPlan) {
  const storage = mockStorage || {};
  const mealPlans = getMealPlans(mockStorage);
  const id = mealPlan.id || generateId();
  const mealPlanData = {
    id,
    name: mealPlan.name,
    items: mealPlan.items,
    date: mealPlan.date || new Date().toISOString().split('T')[0],
    createdAt: mealPlan.createdAt || new Date().toISOString()
  };

  storage[`mealplan:${id}`] = JSON.stringify(mealPlanData);
  if (!mockStorage) {
    localStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(storage));
  }
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
 * Get a single meal plan by ID
 * @param {object} mockStorage - Storage object (for testing) or undefined (use localStorage)
 * @param {string} id - Meal plan ID
 * @returns {object|null} Meal plan data or null
 */
export function getMealPlan(mockStorage, id) {
  const storage = mockStorage || {};
  const key = `mealplan:${id}`;
  if (storage[key]) {
    try {
      return JSON.parse(storage[key]);
    } catch (e) {
      return null;
    }
  }
  return null;
}

/**
 * Delete a meal plan
 * @param {object} mockStorage - Storage object (for testing) or undefined (use localStorage)
 * @param {string} id - Meal plan ID
 */
export function deleteMealPlan(mockStorage, id) {
  const storage = mockStorage || {};
  const key = `mealplan:${id}`;
  delete storage[key];
  if (!mockStorage) {
    const mealPlans = getMealPlans();
    localStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(mealPlans));
  }
}

/**
 * Save settings
 * @param {object} mockStorage - Storage object (for testing) or undefined (use localStorage)
 * @param {object} settings - Settings data
 */
export function saveSettings(mockStorage, settings) {
  const storage = mockStorage || {};
  storage['settings:default'] = JSON.stringify(settings);
  if (!mockStorage) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
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
        apiUrl: 'https://api.openai.com/v1',
        apiKey: '',
        model: 'gpt-4o'
      };
    }
  }
  return {
    apiUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-4o'
  };
}

/**
 * Get all products as an array
 * @returns {Array} Array of products
 */
export function getAllProducts() {
  return getProducts();
}

/**
 * Get all meal plans as an array
 * @returns {Array} Array of meal plans
 */
export function getAllMealPlans() {
  return getMealPlans();
}