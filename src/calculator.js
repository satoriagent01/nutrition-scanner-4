/**
 * Scale nutrients from serving size to arbitrary gram amounts.
 *
 * @param {object} productNutrients - Nutrient data from parser (flat object)
 * @param {number} servingSize - Serving size in grams
 * @param {number} grams - Amount in grams to scale to
 * @returns {object} Scaled nutrient values
 */
export function calculateNutrients(productNutrients, servingSize, grams) {
  const scale = grams / servingSize;
  const result = {};

  for (const [key, value] of Object.entries(productNutrients)) {
    if (value !== undefined) {
      result[key] = Math.round(value * scale * 100) / 100;
    }
  }

  return result;
}

/**
 * Calculate daily total across multiple meal items.
 *
 * @param {Array} mealItems - Array of { productNutrients, servingSize, grams }
 * @returns {object} Total nutrient values
 */
export function calculateDailyTotal(mealItems) {
  const totals = {};

  for (const item of mealItems) {
    const scaled = calculateNutrients(item.productNutrients, item.servingSize, item.grams);

    for (const [key, value] of Object.entries(scaled)) {
      if (totals[key] === undefined) {
        totals[key] = 0;
      }
      totals[key] = Math.round((totals[key] + value) * 100) / 100;
    }
  }

  return totals;
}