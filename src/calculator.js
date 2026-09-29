/**
 * Scale nutrients from serving size to arbitrary gram amounts.
 *
 * @param {object} productNutrients - Nutrient data from parser
 * @param {number} grams - Amount in grams to scale to
 * @returns {object} Scaled nutrient values
 */
export function calculateNutrients(productNutrients, grams) {
  const nutrients = productNutrients.nutrients || {};
  const servingSize = productNutrients.servingSize || 100;
  const scale = grams / servingSize;

  const result = {};

  for (const [key, value] of Object.entries(nutrients)) {
    if (value !== undefined) {
      result[key] = Math.round(value * scale * 100) / 100;
    }
  }

  return result;
}

/**
 * Calculate daily total across multiple meal items.
 *
 * @param {Array} mealItems - Array of { productNutrients, grams }
 * @returns {object} Total nutrient values
 */
export function calculateDailyTotal(mealItems) {
  const totals = {};

  for (const item of mealItems) {
    const scaled = calculateNutrients(item.productNutrients, item.grams);

    for (const [key, value] of Object.entries(scaled)) {
      if (totals[key] === undefined) {
        totals[key] = 0;
      }
      totals[key] = Math.round((totals[key] + value) * 100) / 100;
    }
  }

  return totals;
}