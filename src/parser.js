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

  // Nutrient name mappings (lowercase -> internal name)
  const nutrientMap = {
    // German
    'fett': 'fat',
    'davon gesättigte fett': 'saturatedFat',
    'davon gesättigte fettsäuren': 'saturatedFat',
    'kohlenhydrate': 'carbohydrates',
    'davon zucker': 'sugars',
    'ballaststoffe': 'fiber',
    'eiweiß': 'protein',
    'salz': 'salt',
    // Dutch
    'vetten': 'fat',
    'waarvan': 'saturatedFat',
    'verzadigde vetzuren': 'saturatedFat',
    'koolhydraten': 'carbohydrates',
    'suikers': 'sugars',
    'vezels': 'fiber',
    'eiwitten': 'protein',
    'zout': 'salt',
    // French
    'matières grasses': 'fat',
    'dont acides gras saturés': 'saturatedFat',
    'glucides': 'carbohydrates',
    'dont sucres': 'sugars',
    'fibres alimentaires': 'fiber',
    'protéines': 'protein',
    'sel': 'salt',
    // Italian
    'grassi': 'fat',
    'di cui saturi': 'saturatedFat',
    'carboidrati': 'carbohydrates',
    'di cui zuccheri': 'sugars',
    'fibre': 'fiber',
    'proteine': 'protein',
    'sale': 'salt',
    // English
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
  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();
    if (nutritionKeywords.some(kw => lowerLine.includes(kw))) {
      // Look for serving info on this line or next line
      // Patterns: "30 g = 1 Melto", "glas (200 ml)", "Per 30 g", "Par part (30 g)", "Per porzione (30 g)"
      const servingMatch = line.match(/(\d+(?:[.,]\d+)?)\s*(g|ml)\s*=\s*(\d+)\s*(\w+)/i);
      if (servingMatch) {
        result.servingSize = servingMatch[1] + ' ' + servingMatch[2];
        result.servingUnit = servingMatch[4];
      } else {
        // Try "Per X g" or "Par X g" or "Per X ml"
        const perMatch = line.match(/per\s+(\d+(?:[.,]\d+)?)\s*(g|ml)/i);
        if (perMatch) {
          result.servingSize = perMatch[1] + ' ' + perMatch[2];
          result.servingUnit = perMatch[2];
        }
        // Try "(200 ml)" or "(30 g)" pattern
        const parenMatch = line.match(/\((\d+(?:[.,]\d+)?)\s*(g|ml)\)/i);
        if (parenMatch) {
          result.servingSize = parenMatch[1] + ' ' + parenMatch[2];
          result.servingUnit = parenMatch[2];
        }
      }
      break;
    }
  }

  // Parse nutrient values from the table
  // We always take the first column (per 100g or per 100ml)
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase().trim();

    // Check if this line is a nutrition header
    if (nutritionKeywords.some(kw => lowerLine.includes(kw))) {
      inTable = true;
      continue;
    }

    if (!inTable) continue;

    // Skip header lines (lines with "per", "100", serving info)
    if (lowerLine.match(/^(per|par|per\s+\d+\s*(g|ml)|\d+\s*(g|ml)\s*=\s*\d+)/i)) {
      continue;
    }

    // Try to match nutrient
    for (const [keyword, nutrientKey] of Object.entries(nutrientMap)) {
      if (lowerLine.includes(keyword)) {
        // Extract value from the first column (per 100g/ml)
        // The first value is per 100g, second is per serving
        // Look for number followed by g or kJ or kcal
        if (nutrientKey === 'energyKj' || nutrientKey === 'energyKcal') {
          // For energy, find kJ or kcal specifically
          const kjMatch = line.match(/(\d+(?:[.,]\d+)?)\s*kJ/);
          const kcalMatch = line.match(/(\d+(?:[.,]\d+)?)\s*kcal/);
          if (nutrientKey === 'energyKj' && kjMatch) {
            result.nutrients.energyKj = parseFloat(kjMatch[1].replace(',', '.'));
          } else if (nutrientKey === 'energyKcal' && kcalMatch) {
            result.nutrients.energyKcal = parseFloat(kcalMatch[1].replace(',', '.'));
          }
        } else {
          // For other nutrients, get the first value (per 100g)
          // Match number (with optional comma decimal) followed by g
          const valueMatch = line.match(/(\d+(?:[.,]\d+)?)\s*g/);
          if (valueMatch) {
            result.nutrients[nutrientKey] = parseFloat(valueMatch[1].replace(',', '.'));
          }
        }
        break;
      }
    }
  }

  return result;
}