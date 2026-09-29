/**
 * Scale nutrients from serving size to arbitrary gram amounts.
 *
 * @param {object} productNutrients - Nutrient data from parser
 * @param {number|string} servingSize - Serving size (e.g., 30 or "30 g")
 * @param {number} grams - Amount in grams to scale to
 * @returns {object} Scaled nutrient values
 */
export function calculateNutrients(productNutrients, servingSize, grams) {
  const nutrients = productNutrients.nutrients || {};
  const servingValue = parseServingSize(servingSize);
  const scale = grams / servingValue;

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

/**
 * Parse serving size string or number to a numeric value
 */
function parseServingSize(servingSize) {
  if (typeof servingSize === 'number') {
    return servingSize;
  }
  if (typeof servingSize === 'string') {
    const match = servingSize.match(/(\d+(?:[.,]\d+)?)/);
    if (match) {
      return parseFloat(match[1].replace(',', '.'));
    }
  }
  return 100;
}