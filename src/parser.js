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

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Try to extract product name from the first line if it's not a header
  if (lines.length > 0) {
    const firstLine = lines[0].toLowerCase();
    const headerKeywords = [
      'nährwertdeklaration', 'voedingswaarde', 'valeur nutritionnelle',
      'dichiarazione nutrizionale', 'nutrition facts', 'nährwert',
      'per 100', 'per 100 g', 'per 100 ml', 'per 100',
      'energy', 'fett', 'vetten', 'matières grasses', 'grassi',
      'calories', 'kcal', 'kj', 'proteine', 'proteine', 'protein',
      'protein', 'protein', 'protein', 'protein', 'protein',
      'energy', 'energy', 'energy', 'energy', 'energy',
      'energy', 'energy', 'energy', 'energy', 'energy'
    ];
    const isHeader = headerKeywords.some(kw => firstLine.includes(kw));
    if (!isHeader && lines.length > 1) {
      result.productName = lines[0];
    }
  }

  // Try to extract serving info from header lines
  for (const line of lines) {
    // German: "100 g    30 g = 1 Melto"
    const germanMatch = line.match(/(\d+(?:[.,]\d+)?)\s*g\s*=\s*(\d+(?:[.,]\d+)?)\s*(\w+)/i);
    if (germanMatch) {
      result.servingSize = `${germanMatch[2]} g`;
      result.servingUnit = germanMatch[3];
      continue;
    }
    // Dutch: "glas (200 ml)" or "per 100 ml"
    const dutchServingMatch = line.match(/(\w+)\s*\((\d+(?:[.,]\d+)?)\s*(ml|g)\)/i);
    if (dutchServingMatch) {
      result.servingUnit = dutchServingMatch[1];
      result.servingSize = `${dutchServingMatch[2]} ${dutchServingMatch[3]}`;
      continue;
    }
    // "per 100 ml" or "per 100 g"
    const perMatch = line.match(/per\s+(\d+(?:[.,]\d+)?)\s*(ml|g)/i);
    if (perMatch) {
      result.servingSize = `${perMatch[1]} ${perMatch[2]}`;
      result.servingUnit = perMatch[2];
      continue;
    }
    // "Pour 100 g  Pour 30 g" or "Per 100 g  Per 30 g"
    const pourMatch = line.match(/(?:pour|per)\s+(\d+(?:[.,]\d+)?)\s*(g|ml)/i);
    if (pourMatch && !line.match(/=\s*\d+/)) {
      result.servingSize = `${pourMatch[1]} ${pourMatch[2]}`;
      result.servingUnit = pourMatch[2];
      continue;
    }
  }

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
    'eiweiss': 'protein',
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
    'dont acides gras saturées': 'saturatedFat',
    'glucides': 'carbohydrates',
    'dont sucres': 'sugars',
    'fibres alimentaires': 'fiber',
    'fibres': 'fiber',
    'protéines': 'protein',
    'proteines': 'protein',
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
    'of which saturated': 'saturatedFat',
    'saturates': 'saturatedFat',
    'saturated fat': 'saturatedFat',
    'carbohydrate': 'carbohydrates',
    'carbohydrates': 'carbohydrates',
    'of which sugars': 'sugars',
    'of which sugar': 'sugars',
    'sugars': 'sugars',
    'sugar': 'sugars',
    'fibre': 'fiber',
    'fiber': 'fiber',
    'protein': 'protein',
    'proteins': 'protein',
    'salt': 'salt',
    'sodium': 'salt',
    // Energy
    'energy': 'energy',
    'energie': 'energy',
    'énergie': 'energy',
    'energia': 'energy',
  };

  // Parse each line for nutrient values
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Check for energy line (kJ and kcal)
    if (lowerLine.includes('energy') || lowerLine.includes('energie') ||
        lowerLine.includes('énergie') || lowerLine.includes('energia')) {
      // Try to extract kJ value
      const kjMatch = line.match(/(\d+(?:[.,]\d+)?)\s*(?:kj|kj\s*\/)/i);
      if (kjMatch) {
        result.nutrients.energyKj = parseFloat(kjMatch[1].replace(',', '.'));
      }
      // Try to extract kcal value
      const kcalMatch = line.match(/(\d+(?:[.,]\d+)?)\s*(?:kcal)/i);
      if (kcalMatch) {
        result.nutrients.energyKcal = parseFloat(kcalMatch[1].replace(',', '.'));
      }
      continue;
    }

    // Check for continuation line (kcal on second line of energy)
    if (lowerLine.match(/^\d+\s*kcal/) && result.nutrients.energyKj !== undefined && result.nutrients.energyKcal === undefined) {
      const kcalMatch = line.match(/(\d+(?:[.,]\d+)?)\s*(?:kcal)/i);
      if (kcalMatch) {
        result.nutrients.energyKcal = parseFloat(kcalMatch[1].replace(',', '.'));
      }
      continue;
    }

    // Check for other nutrients
    for (const [keyword, nutrientKey] of Object.entries(nutrientMap)) {
      if (lowerLine.includes(keyword)) {
        // Skip if this is a sub-item line starting with "-"
        if (line.trim().startsWith('-')) {
          // Check if it's a sub-item of a known nutrient
          if (lowerLine.includes('verzadigde vetzuren')) {
            const val = extractValue(line);
            if (val !== null && result.nutrients.saturatedFat === undefined) {
              result.nutrients.saturatedFat = val;
            }
          } else if (lowerLine.includes('suikers')) {
            const val = extractValue(line);
            if (val !== null && result.nutrients.sugars === undefined) {
              result.nutrients.sugars = val;
            }
          } else if (lowerLine.includes('vezels')) {
            const val = extractValue(line);
            if (val !== null && result.nutrients.fiber === undefined) {
              result.nutrients.fiber = val;
            }
          } else if (lowerLine.includes('zoetstoffen')) {
            // sweeteners - skip
          }
          continue;
        }

        const val = extractValue(line);
        if (val !== null) {
          result.nutrients[nutrientKey] = val;
        }
        break;
      }
    }
  }

  return result;
}

/**
 * Extract a numeric value from a line, handling comma as decimal separator
 */
function extractValue(line) {
  // Remove leading dashes and whitespace
  const cleaned = line.replace(/^[-\s]+/, '').trim();

  // Try to find a number followed by 'g' or 'ml'
  const match = cleaned.match(/(\d+(?:[.,]\d+)?)\s*(?:g|ml)/i);
  if (match) {
    return parseFloat(match[1].replace(',', '.'));
  }

  // Try to find a number followed by kJ or kcal
  const energyMatch = cleaned.match(/(\d+(?:[.,]\d+)?)\s*(?:kj|kcal)/i);
  if (energyMatch) {
    return parseFloat(energyMatch[1].replace(',', '.'));
  }

  // Try to find a standalone number
  const numMatch = cleaned.match(/(\d+(?:[.,]\d+)?)/);
  if (numMatch) {
    return parseFloat(numMatch[1].replace(',', '.'));
  }

  return null;
}