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

  // Try to extract product name from first line (before known header keywords)
  const headerKeywords = [
    'nährwertdeklaration', 'nährwertangaben', 'voedingswaarde', 'valeur nutritionnelle',
    'dichiarazione nutrizionale', 'nutrition facts', 'nutrition information',
    'nährwerttabelle', 'voedingsinformatie', 'tableau nutritionnel',
    'tabella nutrizionale', 'nutrition table'
  ];

  for (let i = 0; i < Math.min(lines.length, 3); i++) {
    const lower = lines[i].toLowerCase();
    const isHeader = headerKeywords.some(kw => lower.includes(kw));
    if (!isHeader && lines[i].length > 2 && lines[i].length < 100) {
      // Check if it looks like a product name (not a number line)
      if (!/^\d/.test(lines[i]) && !/^\d/.test(lines[i].replace(/[^a-zA-ZäöüÄÖÜßéèêëàâîôùûçàâèéêëîôùûçç]/g, ''))) {
        result.productName = lines[i];
        break;
      }
    }
  }

  // Try to extract serving size info from header lines
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];

    // Look for serving size patterns like "30 g = 1 Melto" or "glas (200 ml)"
    const servingMatch = line.match(/(\d+(?:[.,]\d+)?)\s*(g|ml|kg|l)\s*(?:=\s*(.+?))?(?:\s*=\s*(.+?))?$/);
    if (servingMatch) {
      const size = servingMatch[1].replace(',', '.');
      const unit = servingMatch[2];
      const extra = servingMatch[3] || servingMatch[4] || '';
      result.servingSize = `${size} ${unit}`;
      if (extra) {
        result.servingUnit = extra.trim();
      } else {
        result.servingUnit = unit;
      }
      break;
    }

    // Look for "per X unit" patterns
    const perMatch = line.match(/(?:per|pour|per|pro|pro|pro)\s+(\d+(?:[.,]\d+)?)\s*(g|ml)/i);
    if (perMatch) {
      const size = perMatch[1].replace(',', '.');
      const unit = perMatch[2];
      result.servingSize = `${size} ${unit}`;
      result.servingUnit = unit;
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
    'sodium': 'salt',
    // Energy
    'energie': 'energy',
    'energy': 'energy',
    'calories': 'energy',
    'calorific': 'energy',
  };

  // Parse nutrient values from lines
  // First, determine if we have a two-column format (per 100g and per serving)
  // or a single-column format (per 100g only)
  let hasTwoColumns = false;
  let firstNutrientLine = null;

  for (const line of lines) {
    // Check if line has two numeric values (two-column format)
    const values = extractValues(line);
    if (values.length >= 2) {
      // Check if it looks like a nutrient line (has a known nutrient keyword)
      const lowerLine = line.toLowerCase();
      const isNutrient = Object.keys(nutrientMap).some(kw => lowerLine.includes(kw));
      if (isNutrient) {
        hasTwoColumns = true;
        firstNutrientLine = line;
        break;
      }
    }
  }

  // Parse each line for nutrient values
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Skip header lines
    if (headerKeywords.some(kw => lowerLine.includes(kw))) continue;

    // Check for energy line (can be on one line or two)
    if (lowerLine.includes('energy') || lowerLine.includes('energie') || lowerLine.includes('calories')) {
      // Check if next line is also energy (kcal line)
      if (lowerLine.includes('kj')) {
        const values = extractValues(line);
        if (values.length >= 1) {
          result.nutrients.energyKj = parseFloat(values[0].replace(',', '.'));
        }
      }
      if (lowerLine.includes('kcal')) {
        const values = extractValues(line);
        if (values.length >= 1) {
          result.nutrients.energyKcal = parseFloat(values[0].replace(',', '.'));
        }
      }
      continue;
    }

    // Check for kcal line that might be continuation of energy
    if (lowerLine.includes('kcal') && !lowerLine.includes('kj')) {
      // This is likely the kcal continuation line
      const values = extractValues(line);
      if (values.length >= 1) {
        result.nutrients.energyKcal = parseFloat(values[0].replace(',', '.'));
      }
      continue;
    }

    // Check for other nutrients
    for (const [keyword, nutrientKey] of Object.entries(nutrientMap)) {
      if (keyword === 'energy') continue; // already handled
      if (lowerLine.includes(keyword)) {
        const values = extractValues(line);
        if (values.length >= 1) {
          const val = parseFloat(values[0].replace(',', '.'));
          if (!isNaN(val)) {
            result.nutrients[nutrientKey] = val;
          }
        }
        break;
      }
    }
  }

  return result;
}

/**
 * Extract numeric values from a line of text.
 * Handles comma as decimal separator.
 * @param {string} line
 * @returns {string[]} Array of numeric value strings
 */
function extractValues(line) {
  const values = [];
  // Match numbers with optional comma decimals, followed by optional unit
  const regex = /(\d+(?:[.,]\d+)?)/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    values.push(match[1]);
  }
  return values;
}