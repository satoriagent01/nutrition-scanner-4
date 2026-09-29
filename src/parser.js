/**
 * Parse OCR text into structured nutrition data for multiple languages.
 * Handles German, Dutch, French, Italian, and English label formats.
 *
 * @param {string} text - Raw OCR text from the nutrition label
 * @returns {{ productName: string, servingSize: number, servingUnit: string, nutrients: object }}
 */
export function parseNutritionText(text) {
  const result = {
    productName: '',
    servingSize: 100,
    servingUnit: 'g',
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

  // Extract product name from header (first few lines before nutrition table)
  const lines = text.split('\n');
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

  // Parse nutrition table - look for the table section
  const tableSection = extractTableSection(text);

  if (tableSection) {
    parseTableSection(tableSection, result);
  }

  return result;
}

/**
 * Extract the nutrition table section from OCR text
 */
function extractTableSection(text) {
  const lines = text.split('\n');
  let inTable = false;
  let tableLines = [];

  const tableKeywords = [
    'nährwertdeklaration', 'déclaration nutritionnelle', 'dichiarazione nutrizionale',
    'voedingswaarde', 'nutrition facts', 'nutrition information',
    'nährwerte', 'valeur nutritionnelle', 'valore nutrizionale',
    'voedingswaarden', 'nutrition table', 'per 100', 'per 100 g',
    'per 100 ml', 'pro 100 g', 'pro 100 ml', 'pour 100 g', 'pour 100 ml'
  ];

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();

    if (tableKeywords.some(kw => lowerLine.includes(kw))) {
      inTable = true;
    }

    if (inTable) {
      tableLines.push(line);
      // Stop at end of table (empty line or non-table content)
      if (line.trim() === '' && tableLines.length > 3) {
        break;
      }
    }
  }

  return tableLines.length > 0 ? tableLines.join('\n') : null;
}

/**
 * Parse the nutrition table section
 */
function parseTableSection(tableText, result) {
  const lines = tableText.split('\n');

  // Look for serving size info
  const servingPatterns = [
    /(?:per|pro|pour)\s*(\d+)\s*(?:g|ml|gram|gramme)/i,
    /(\d+)\s*(?:g|ml)\s*=\s*(\d+)\s*(?:g|ml)/i,
    /(\d+)\s*(?:g|ml)\s*=\s*1\s*(?:portion|serv|melto|stuk|barr)/i
  ];

  for (const line of lines) {
    for (const pattern of servingPatterns) {
      const match = line.match(pattern);
      if (match) {
        if (match[2]) {
          result.servingSize = parseFloat(match[2].replace(',', '.'));
        } else {
          result.servingSize = parseFloat(match[1].replace(',', '.'));
        }
        result.servingUnit = line.includes('ml') ? 'ml' : 'g';
        break;
      }
    }
  }

  // Nutrient mapping: [regex pattern, nutrient key]
  const nutrientPatterns = [
    // Energy
    [/energ(?:ie|y)\s*(?:\/\s*(?:énergie|energie|energia))?\s*(?:\d+\s*(?:kJ|kj|kcal|Kcal|KCAL))?\s*(\d+)\s*(?:kJ|kj)/i, 'energyKj'],
    [/energ(?:ie|y)\s*(?:\/\s*(?:énergie|energie|energia))?\s*(\d+)\s*(?:kcal|Kcal|KCAL)/i, 'energyKcal'],

    // Fat
    [/fett\s*(?:\/\s*(?:matières\s*grasses|vetten|grassi))?\s*(\d+)\s*(?:g|gram)/i, 'fat'],
    [/davon\s*gesättigte\s*fettsäuren\s*(?:\/\s*(?:acides\s*gras\s*saturés|verzadigde\s*vetzuren|acidi\s*grassi\s*saturi))?\s*(\d+)\s*(?:g|gram)/i, 'saturatedFat'],

    // Carbohydrates
    [/kohlenhydrate\s*(?:\/\s*(?:glucides|koolhydraten|carboidrati))?\s*(\d+)\s*(?:g|gram)/i, 'carbohydrates'],
    [/davon\s*zucker\s*(?:\/\s*(?:dont\s*sucres|waarvan\s*suikers|zuccheri))?\s*(\d+)\s*(?:g|gram)/i, 'sugars'],

    // Fiber
    [/ballaststoffe\s*(?:\/\s*(?:fibres\s*alimentaires|vezels|fibre))?\s*(\d+)\s*(?:g|gram)/i, 'fiber'],

    // Protein
    [/eiweiß\s*(?:\/\s*(?:protéines|eiwitten|proteine))?\s*(\d+)\s*(?:g|gram)/i, 'protein'],

    // Salt/Sodium
    [/salz\s*(?:\/\s*(?:sel|zout|sale))?\s*(\d+)\s*(?:g|gram)/i, 'salt'],
    [/salz\s*(?:\/\s*(?:sel|zout|sale))?\s*(\d+)\s*(?:mg)/i, 'sodium'],
  ];

  for (const line of lines) {
    for (const [pattern, nutrientKey] of nutrientPatterns) {
      const match = line.match(pattern);
      if (match) {
        const value = parseFloat(match[1].replace(',', '.'));
        if (nutrientKey === 'sodium') {
          // Convert mg to g for sodium
          result.nutrients[nutrientKey] = value / 1000;
        } else {
          result.nutrients[nutrientKey] = value;
        }
        break;
      }
    }
  }

  // Also try English patterns
  const englishPatterns = [
    [/energy\s*(?:\d+\s*(?:kJ|kj))?\s*(\d+)\s*(?:kcal|Kcal|KCAL)/i, 'energyKcal'],
    [/energy\s*(\d+)\s*(?:kJ|kj)/i, 'energyKj'],
    [/fat\s*(\d+)\s*(?:g|gram)/i, 'fat'],
    [/of\s*which\s*saturates\s*(\d+)\s*(?:g|gram)/i, 'saturatedFat'],
    [/carbohydrate\s*(\d+)\s*(?:g|gram)/i, 'carbohydrates'],
    [/of\s*which\s*sugars\s*(\d+)\s*(?:g|gram)/i, 'sugars'],
    [/fiber\s*(\d+)\s*(?:g|gram)/i, 'fiber'],
    [/protein\s*(\d+)\s*(?:g|gram)/i, 'protein'],
    [/salt\s*(\d+)\s*(?:g|gram)/i, 'salt'],
    [/sodium\s*(\d+)\s*(?:mg)/i, 'sodium'],
  ];

  for (const line of lines) {
    for (const [pattern, nutrientKey] of englishPatterns) {
      const match = line.match(pattern);
      if (match) {
        const value = parseFloat(match[1].replace(',', '.'));
        if (nutrientKey === 'sodium') {
          result.nutrients[nutrientKey] = value / 1000;
        } else {
          result.nutrients[nutrientKey] = value;
        }
        break;
      }
    }
  }

  return result;
}