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
      vitamins: undefined,
    },
  };

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Try to extract product name from the first line if it's not a header
  if (lines.length > 0) {
    const firstLine = lines[0].toLowerCase();
    const headerKeywords = [
      "nahrwertdeklaration",
      "nahrwert",
      "voedingswaarde",
      "valeur nutritionnelle",
      "dichiarazione nutrizionale",
      "nutrition facts",
      "per 100",
      "energy",
      "fett",
      "vetten",
      "matieres grasses",
      "grassi",
      "calories",
      "kcal",
      "kj",
      "proteine",
      "protein",
      "glucides",
      "carboidrati",
      "eiweiss",
      "eiwitten",
      "sel",
      "zout",
      "sale",
      "vegan",
      "vegetarisch",
    ];
    const isHeader = headerKeywords.some((kw) => firstLine.includes(kw));
    if (!isHeader && lines.length > 1) {
      result.productName = lines[0];
    }
  }

  // Try to extract serving info from header lines
  for (const line of lines) {
    // German: "100 g    30 g = 1 Melto"
    const germanMatch = line.match(
      /(\d+(?:[.,]\d+)?)\s*g\s*=\s*(\d+(?:[.,]\d+)?)\s*(\w+)/i
    );
    if (germanMatch) {
      result.servingSize = `${germanMatch[2]} g`;
      result.servingUnit = germanMatch[3];
      continue;
    }
    // Dutch: "glas (200 ml)" or "per 100 ml  glas (200 ml)"
    const dutchMatch = line.match(/(\w+)\s*\((\d+(?:[.,]\d+)?)\s*(ml|g)\)/i);
    if (dutchMatch) {
      result.servingUnit = dutchMatch[1];
      result.servingSize = `${dutchMatch[2]} ${dutchMatch[3]}`;
      continue;
    }
    // French: "Pour 100 g  Pour 30 g"
    const frenchMatch = line.match(/pour\s+(\d+(?:[.,]\d+)?)\s*(ml|g)/i);
    if (frenchMatch && line.toLowerCase().includes("pour")) {
      // Check if there's a second "pour" with a different value
      const allPours = line.match(/pour\s+(\d+(?:[.,]\d+)?)\s*(ml|g)/gi);
      if (allPours && allPours.length >= 2) {
        const secondMatch = allPours[1].match(
          /pour\s+(\d+(?:[.,]\d+)?)\s*(ml|g)/i
        );
        if (secondMatch) {
          result.servingSize = `${secondMatch[1]} ${secondMatch[2]}`;
          result.servingUnit = secondMatch[2];
        }
      } else if (frenchMatch) {
        result.servingSize = `${frenchMatch[1]} ${frenchMatch[2]}`;
        result.servingUnit = frenchMatch[2];
      }
      continue;
    }
    // Italian: "Per 100 g  Per 30 g"
    const italianMatch = line.match(/per\s+(\d+(?:[.,]\d+)?)\s*(ml|g)/i);
    if (italianMatch && line.toLowerCase().includes("per")) {
      const allPers = line.match(/per\s+(\d+(?:[.,]\d+)?)\s*(ml|g)/gi);
      if (allPers && allPers.length >= 2) {
        const secondMatch = allPers[1].match(
          /per\s+(\d+(?:[.,]\d+)?)\s*(ml|g)/i
        );
        if (secondMatch) {
          result.servingSize = `${secondMatch[1]} ${secondMatch[2]}`;
          result.servingUnit = secondMatch[2];
        }
      } else if (italianMatch) {
        result.servingSize = `${italianMatch[1]} ${italianMatch[2]}`;
        result.servingUnit = italianMatch[2];
      }
      continue;
    }
    // English: "Per 100 g  Per 30 g"
    const englishMatch = line.match(/per\s+(\d+(?:[.,]\d+)?)\s*(ml|g)/i);
    if (englishMatch && line.toLowerCase().includes("per")) {
      const allPers = line.match(/per\s+(\d+(?:[.,]\d+)?)\s*(ml|g)/gi);
      if (allPers && allPers.length >= 2) {
        const secondMatch = allPers[1].match(
          /per\s+(\d+(?:[.,]\d+)?)\s*(ml|g)/i
        );
        if (secondMatch) {
          result.servingSize = `${secondMatch[1]} ${secondMatch[2]}`;
          result.servingUnit = secondMatch[2];
        }
      } else if (englishMatch) {
        result.servingSize = `${englishMatch[1]} ${englishMatch[2]}`;
        result.servingUnit = englishMatch[2];
      }
      continue;
    }
    // Simple "per 100 ml" or "per 100 g" format (no second column)
    const simpleMatch = line.match(/per\s+(\d+(?:[.,]\d+)?)\s*(ml|g)/i);
    if (simpleMatch) {
      result.servingSize = `${simpleMatch[1]} ${simpleMatch[2]}`;
      result.servingUnit = simpleMatch[2];
      continue;
    }
  }

  // Parse nutrient rows - we need to identify the per-100g column values
  // The first value in each row is per 100g/ml, the second is per serving
  const nutrientMap = {
    // German
    "energie": "energyKj",
    "fett": "fat",
    "davon gesättigte fett": "saturatedFat",
    "davon gesättigte fettsäuren": "saturatedFat",
    "kohlenhydrate": "carbohydrates",
    "davon zucker": "sugars",
    "ballaststoffe": "fiber",
    "eiweiß": "protein",
    "eiweiss": "protein",
    "salz": "salt",
    // Dutch
    "energie": "energyKj",
    "vetten": "fat",
    "waarvan verzadigde vetzuren": "saturatedFat",
    "waarvan verzadigde": "saturatedFat",
    "koolhydraten": "carbohydrates",
    "waarvan suikers": "sugars",
    "waarvan": "sugars",
    "vezels": "fiber",
    "eiwitten": "protein",
    "zout": "salt",
    // French
    "énergie": "energyKj",
    "energie": "energyKj",
    "matières grasses": "fat",
    "matieres grasses": "fat",
    "dont acides gras saturés": "saturatedFat",
    "dont acides gras satures": "saturatedFat",
    "glucides": "carbohydrates",
    "dont sucres": "sugars",
    "fibres alimentaires": "fiber",
    "fibres": "fiber",
    "protéines": "protein",
    "proteines": "protein",
    "sel": "salt",
    // Italian
    "energia": "energyKj",
    "grassi": "fat",
    "di cui saturi": "saturatedFat",
    "carboidrati": "carbohydrates",
    "di cui zuccheri": "sugars",
    "fibre": "fiber",
    "proteine": "protein",
    "sale": "salt",
    // English
    "energy": "energyKj",
    "fat": "fat",
    "of which saturates": "saturatedFat",
    "of which saturated": "saturatedFat",
    "carbohydrate": "carbohydrates",
    "carbohydrates": "carbohydrates",
    "of which sugars": "sugars",
    "of which sugar": "sugars",
    "fibre": "fiber",
    "fiber": "fiber",
    "protein": "protein",
    "salt": "salt",
    "sodium": "salt",
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip header lines
    const lowerLine = line.toLowerCase();
    if (
      lowerLine.includes("nahrwertdeklaration") ||
      lowerLine.includes("voedingswaarde") ||
      lowerLine.includes("valeur nutritionnelle") ||
      lowerLine.includes("dichiarazione nutrizionale") ||
      lowerLine.includes("nutrition facts") ||
      lowerLine.includes("per 100") ||
      lowerLine.includes("pour 100") ||
      lowerLine.includes("glas (") ||
      lowerLine.includes(" = ")
    ) {
      continue;
    }

    // Try to match a nutrient row
    // Format: "NutrientName  value unit  value unit"
    // or: "NutrientName  value kJ / value kcal  value kJ / value kcal"
    // or: "- sub-nutrient  value unit  value unit"

    // First, try to identify the nutrient name
    let matchedNutrient = null;
    let matchedKey = null;

    // Check for sub-items (lines starting with "-")
    let strippedLine = line;
    if (line.startsWith("- ")) {
      strippedLine = line.substring(2).trim();
    }

    // Try to match known nutrient names
    for (const [name, key] of Object.entries(nutrientMap)) {
      if (strippedLine.toLowerCase().startsWith(name)) {
        matchedNutrient = name;
        matchedKey = key;
        break;
      }
    }

    if (!matchedNutrient) continue;

    // Extract values from the line
    // Remove the nutrient name and leading dashes/spaces
    const afterName = strippedLine.substring(matchedNutrient.length).trim();

    // Try to parse values - they can be in various formats:
    // "  33 g     10 g"
    // "  2292 kJ  688 kJ"
    // "  2292 kJ / 549 kcal  688 kJ / 165 kcal"
    // "  0,7 g  1,4 g"

    // First, check if this is an energy line (has kJ and kcal)
    if (matchedKey === "energyKj") {
      // Energy lines have both kJ and kcal values
      // Pattern: "  2292 kJ / 549 kcal  688 kJ / 165 kcal"
      // or: "  2292 kJ  688 kJ" followed by next line "         549 kcal 165 kcal"

      // Try to find kJ value (first value before / or before second column)
      const kJMatch = afterName.match(/(\d+(?:[.,]\d+)?)\s*kj/i);
      if (kJMatch) {
        result.nutrients.energyKj = parseFloat(kJMatch[1].replace(",", "."));
      }

      // Try to find kcal value (after /)
      const kcalMatch = afterName.match(/(\d+(?:[.,]\d+)?)\s*kcal/i);
      if (kcalMatch) {
        result.nutrients.energyKcal = parseFloat(
          kcalMatch[1].replace(",", ".")
        );
      }

      // If no kcal found on this line, check next line
      if (
        result.nutrients.energyKcal === undefined &&
        i + 1 < lines.length
      ) {
        const nextLine = lines[i + 1].trim();
        const nextKcalMatch = nextLine.match(/(\d+(?:[.,]\d+)?)\s*kcal/i);
        if (nextKcalMatch) {
          result.nutrients.energyKcal = parseFloat(
            nextKcalMatch[1].replace(",", ".")
          );
          // Skip the next line since we consumed it
          i++;
        }
      }

      continue;
    }

    // For other nutrients, extract the first value (per 100g/ml)
    // The value is a number followed by a unit (g, ml, kJ, kcal, %)
    const valueMatch = afterName.match(/(\d+(?:[.,]\d+)?)\s*(g|ml|kj|kcal|%)/i);
    if (valueMatch) {
      const value = parseFloat(valueMatch[1].replace(",", "."));
      result.nutrients[matchedKey] = value;
    }
  }

  return result;
}