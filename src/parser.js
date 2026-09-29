/**
 * Parse OCR text into structured nutrition data for multiple languages.
 * Handles German, Dutch, French, Italian, and English label formats.
 *
 * @param {string} text - Raw OCR text from the nutrition label
 * @returns {{ productName: string|undefined, servingSize: string, servingUnit: string, nutrients: object }}
 */
export function parseNutritionText(text) {
  const result = {
    productName: undefined,
    servingSize: "100 g",
    servingUnit: "g",
    nutrients: {
      energyKj: undefined,
      energyKcal: undefined,
      fat: undefined,
      saturatedFat: undefined,
      carbohydrates: undefined,
      sugars: undefined,
      fiber: undefined,
      protein: undefined,
      salt: undefined,
      sodium: undefined,
      vitamins: undefined
    }
  };

  const lines = text.split('\n');

  // Extract product name from header (lines before nutrition table)
  const nutritionKeywords = [
    'nährwertdeklaration', 'déclaration nutritionnelle', 'dichiarazione nutrizionale',
    'voedingswaarde', 'nutrition facts', 'nutrition information',
    'nährwerte', 'valeur nutritionnelle', 'valore nutrizionale',
    'voedingswaarden', 'nutrition table'
  ];

  let productNameLines = [];
  let foundNutritionHeader = false;

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();
    if (!foundNutritionHeader) {
      if (nutritionKeywords.some(kw => lowerLine.includes(kw))) {
        foundNutritionHeader = true;
      } else if (line.trim().length > 0 && line.trim().length < 80) {
        productNameLines.push(line.trim());
      }
    }
  }

  if (productNameLines.length > 0) {
    result.productName = productNameLines.join(' ').substring(0, 100);
  }

  // Parse serving size from header line
  // Look for patterns like "30 g = 1 Melto", "glas (200 ml)", "Per 30 g", "Pour 30 g"
  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();
    if (nutritionKeywords.some(kw => lowerLine.includes(kw))) {
      // Parse serving info from the same line or next line
      const servingMatch = line.match(/(\d+(?:[.,]\d+)?)\s*(g|ml|g\s*=\s*\d+\s*(?:g|Melto|glas|portion|servings?))|(\d+(?:[.,]\d+)?)\s*(g|ml)\s*=\s*(\d+)\s*(\w+)|(\d+(?:[.,]\d+)?)\s*(g|ml)\s*=\s*(\d+)\s*(\w+)|(\d+(?:[.,]\d+)?)\s*(g|ml)\s*=\s*(\d+)\s*(\w+)|(\d+(?:[.,]\d+)?)\s*(g|ml)\s*=\s*(\d+)\s*(\w+)/i);
      if (servingMatch) {
        // Try to find serving size and unit
        const sizeMatch = line.match(/(\d+(?:[.,]\d+)?)\s*(g|ml)/i);
        if (sizeMatch) {
          result.servingSize = sizeMatch[0];
        }
        const unitMatch = line.match(/=\s*(\d+)\s*(\w+)/i);
        if (unitMatch) {
          result.servingUnit = unitMatch[2];
        }
      }
      break;
    }
  }

  // Also check for "per 100 ml" or "per 100 g" patterns
  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();
    const perMatch = lowerLine.match(/per\s+(\d+(?:[.,]\d+)?)\s*(g|ml)/);
    if (perMatch) {
      result.servingSize = perMatch[0];
      result.servingUnit = perMatch[2];
    }
  }

  // Parse nutrient values from the table
  parseNutrients(lines, result);

  return result;
}

/**
 * Parse nutrient values from table lines
 */
function parseNutrients(lines, result) {
  // Nutrient name mappings (lowercase -> internal name)
  const nutrientMap = {
    // German
    'energie': 'energyKj',
    'kcal': 'energyKcal',
    'fett': 'fat',
    'davon gesättigte fett': 'saturatedFat',
    'davon gesättigte fettsäuren': 'saturatedFat',
    'kohlenhydrate': 'carbohydrates',
    'davon zucker': 'sugars',
    'ballaststoffe': 'fiber',
    'eiweiß': 'protein',
    'salz': 'salt',
    // Dutch
    'energie': 'energyKj',
    'vetten': 'fat',
    'waarvan': 'saturatedFat',
    'verzadigde vetzuren': 'saturatedFat',
    'koolhydraten': 'carbohydrates',
    'suikers': 'sugars',
    'vezels': 'fiber',
    'eiwitten': 'protein',
    'zout': 'salt',
    // French
    'énergie': 'energyKj',
    'matières grasses': 'fat',
    'dont acides gras saturés': 'saturatedFat',
    'glucides': 'carbohydrates',
    'dont sucres': 'sugars',
    'fibres alimentaires': 'fiber',
    'protéines': 'protein',
    'sel': 'salt',
    // Italian
    'energia': 'energyKj',
    'grassi': 'fat',
    'di cui saturi': 'saturatedFat',
    'carboidrati': 'carbohydrates',
    'di cui zuccheri': 'sugars',
    'fibre': 'fiber',
    'proteine': 'protein',
    'sale': 'salt',
    // English
    'energy': 'energyKj',
    'fat': 'fat',
    'of which saturates': 'saturatedFat',
    'saturates': 'saturatedFat',
    'carbohydrate': 'carbohydrates',
    'of which sugars': 'sugars',
    'sugars': 'sugars',
    'fibre': 'fiber',
    'fiber': 'fiber',
    'protein': 'protein',
    'salt': 'salt',
    'sodium': 'sodium',
  };

  // Find the table section (after nutrition header)
  let inTable = false;
  let prevLine = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase().trim();

    // Check if this line is a nutrition header
    const nutritionKeywords = [
      'nährwertdeklaration', 'déclaration nutritionnelle', 'dichiarazione nutrizionale',
      'voedingswaarde', 'nutrition facts', 'nutrition information',
      'nährwerte', 'valeur nutritionnelle', 'valore nutrizionale',
      'voedingswaarden', 'nutrition table'
    ];

    if (nutritionKeywords.some(kw => lowerLine.includes(kw))) {
      inTable = true;
      prevLine = line;
      continue;
    }

    if (!inTable) continue;

    // Skip header lines (lines with "per", "100", serving info)
    if (lowerLine.includes('per') && lowerLine.includes('g')) {
      prevLine = line;
      continue;
    }
    if (lowerLine.match(/^\d+\s*(g|ml)/)) {
      prevLine = line;
      continue;
    }

    // Try to match nutrient
    for (const [keyword, nutrientKey] of Object.entries(nutrientMap)) {
      if (lowerLine.includes(keyword)) {
        // Extract value - look for number followed by g or kJ or kcal
        // The first value is per 100g, second is per serving
        const valueMatch = line.match(/(\d+(?:[.,]\d+)?)\s*(g|kJ|kcal)/);
        if (valueMatch) {
          let value = parseFloat(valueMatch[1].replace(',', '.'));
          if (nutrientKey === 'energyKj' || nutrientKey === 'energyKcal') {
            // For energy, we need to find the right column
            // Look for kJ or kcal specifically
            const kjMatch = line.match(/(\d+(?:[.,]\d+)?)\s*kJ/);
            const kcalMatch = line.match(/(\d+(?:[.,]\d+)?)\s*kcal/);
            if (nutrientKey === 'energyKj' && kjMatch) {
              result.nutrients.energyKj = parseFloat(kjMatch[1].replace(',', '.'));
            } else if (nutrientKey === 'energyKcal' && kcalMatch) {
              result.nutrients.energyKcal = parseFloat(kcalMatch[1].replace(',', '.'));
            }
          } else {
            result.nutrients[nutrientKey] = value;
          }
        }
        break;
      }
    }

    prevLine = line;
  }
}