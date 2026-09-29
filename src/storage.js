/**
 * localStorage persistence for products, meal plans, and settings.
 * Uses localStorage API - only called from browser context.
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
 * @param {object} product - Product data
 * @returns {string} Product ID
 */
export function saveProduct(product) {
  const products = getProducts();
  const id = product.id || generateId();
  const productData = {
    id,
    name: product.name,
    servingSize: product.servingSize,
    servingUnit: product.servingUnit,
    nutrients: product.nutrients,
    createdAt: product.createdAt || new Date().toISOString()
  };

  products[id] = productData;
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  return id;
}

/**
 * Get all products
 * @returns {object} Products object
 */
export function getProducts() {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : {};
}

/**
 * Get a single product by ID
 * @param {string} id - Product ID
 * @returns {object|null} Product data or null
 */
export function getProduct(id) {
  const products = getProducts();
  return products[id] || null;
}

/**
 * Delete a product
 * @param {string} id - Product ID
 */
export function deleteProduct(id) {
  const products = getProducts();
  delete products[id];
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

/**
 * Save a meal plan
 * @param {object} mealPlan - Meal plan data
 * @returns {string} Meal plan ID
 */
export function saveMealPlan(mealPlan) {
  const mealPlans = getMealPlans();
  const id = mealPlan.id || generateId();
  const mealPlanData = {
    id,
    name: mealPlan.name,
    items: mealPlan.items,
    date: mealPlan.date || new Date().toISOString().split('T')[0],
    createdAt: mealPlan.createdAt || new Date().toISOString()
  };

  mealPlans[id] = mealPlanData;
  localStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(mealPlans));
  return id;
}

/**
 * Get all meal plans
 * @returns {object} Meal plans object
 */
export function getMealPlans() {
  const data = localStorage.getItem(STORAGE_KEYS.MEAL_PLANS);
  return data ? JSON.parse(data) : {};
}

/**
 * Get a single meal plan by ID
 * @param {string} id - Meal plan ID
 * @returns {object|null} Meal plan data or null
 */
export function getMealPlan(id) {
  const mealPlans = getMealPlans();
  return mealPlans[id] || null;
}

/**
 * Delete a meal plan
 * @param {string} id - Meal plan ID
 */
export function deleteMealPlan(id) {
  const mealPlans = getMealPlans();
  delete mealPlans[id];
  localStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(mealPlans));
}

/**
 * Save settings
 * @param {object} settings - Settings data
 */
export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

/**
 * Get settings
 * @returns {object} Settings data
 */
export function getSettings() {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : {
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
  const products = getProducts();
  return Object.values(products);
}

/**
 * Get all meal plans as an array
 * @returns {Array} Array of meal plans
 */
export function getAllMealPlans() {
  const mealPlans = getMealPlans();
  return Object.values(mealPlans);
}