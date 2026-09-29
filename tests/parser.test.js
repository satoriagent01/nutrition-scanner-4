import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { parseNutritionText } from "../src/parser.js";

describe("parser - parseNutritionText", () => {
  test("AC-2: should parse German nutrition label", () => {
    const text = `Nährwertdeklaration
100 g    30 g = 1 Melto
Energie  2292 kJ  688 kJ
         549 kcal 165 kcal
Fett     33 g     10 g
davon gesättigte Fettsäuren  13 g  3,9 g
Kohlenhydrate  55 g  16 g
davon Zucker  45 g  14 g
Ballaststoffe  2,4 g  0,7 g
Eiweiß  6,8 g  2,0 g
Salz  0,18 g  0,05 g`;

    const result = parseNutritionText(text);

    assert.strictEqual(result.productName, undefined);
    assert.strictEqual(result.servingSize, "30 g");
    assert.strictEqual(result.servingUnit, "Melto");
    assert.strictEqual(result.nutrients.energyKj, 2292);
    assert.strictEqual(result.nutrients.energyKcal, 549);
    assert.strictEqual(result.nutrients.fat, 33);
    assert.strictEqual(result.nutrients.saturatedFat, 13);
    assert.strictEqual(result.nutrients.carbohydrates, 55);
    assert.strictEqual(result.nutrients.sugars, 45);
    assert.strictEqual(result.nutrients.fiber, 2.4);
    assert.strictEqual(result.nutrients.protein, 6.8);
    assert.strictEqual(result.nutrients.salt, 0.18);
  });

  test("AC-2: should parse Dutch nutrition label", () => {
    const text = `Voedingswaarde per 100 ml  glas (200 ml)
energie  199 kJ / 47 kcal  399 kJ / 94 kcal
vetten, waarvan  0 g  0 g
- verzadigde vetzuren  0 g  0 g
- onverzadigde vetzuren  0 g  0 g
koolhydraten, waarvan  11 g  22 g
- suikers  10 g  20 g
- zoetstoffen  0,7 g  1,4 g
vezels  0,4 g  0,8 g
eiwitten  0 g  0 g
zout  0 g  0 g`;

    const result = parseNutritionText(text);

    assert.strictEqual(result.servingSize, "200 ml");
    assert.strictEqual(result.servingUnit, "glas");
    assert.strictEqual(result.nutrients.energyKj, 199);
    assert.strictEqual(result.nutrients.energyKcal, 47);
    assert.strictEqual(result.nutrients.fat, 0);
    assert.strictEqual(result.nutrients.saturatedFat, 0);
    assert.strictEqual(result.nutrients.carbohydrates, 11);
    assert.strictEqual(result.nutrients.sugars, 10);
    assert.strictEqual(result.nutrients.fiber, 0.4);
    assert.strictEqual(result.nutrients.protein, 0);
    assert.strictEqual(result.nutrients.salt, 0);
  });

  test("AC-2: should parse French nutrition label", () => {
    const text = `Valeur nutritionnelle
Pour 100 g  Pour 30 g
Énergie  2292 kJ  688 kJ
         549 kcal 165 kcal
Matières grasses  33 g  10 g
dont acides gras saturés  13 g  3,9 g
Glucides  55 g  16 g
dont sucres  45 g  14 g
Fibres alimentaires  2,4 g  0,7 g
Protéines  6,8 g  2,0 g
Sel  0,18 g  0,05 g`;

    const result = parseNutritionText(text);

    assert.strictEqual(result.nutrients.energyKj, 2292);
    assert.strictEqual(result.nutrients.energyKcal, 549);
    assert.strictEqual(result.nutrients.fat, 33);
    assert.strictEqual(result.nutrients.saturatedFat, 13);
    assert.strictEqual(result.nutrients.carbohydrates, 55);
    assert.strictEqual(result.nutrients.sugars, 45);
    assert.strictEqual(result.nutrients.fiber, 2.4);
    assert.strictEqual(result.nutrients.protein, 6.8);
    assert.strictEqual(result.nutrients.salt, 0.18);
  });

  test("AC-2: should parse Italian nutrition label", () => {
    const text = `Dichiarazione nutrizionale
Per 100 g  Per 30 g
Energia  2292 kJ  688 kJ
         549 kcal 165 kcal
Grassi  33 g  10 g
di cui saturi  13 g  3,9 g
Carboidrati  55 g  16 g
di cui zuccheri  45 g  14 g
Fibre  2,4 g  0,7 g
Proteine  6,8 g  2,0 g
Sale  0,18 g  0,05 g`;

    const result = parseNutritionText(text);

    assert.strictEqual(result.nutrients.energyKj, 2292);
    assert.strictEqual(result.nutrients.energyKcal, 549);
    assert.strictEqual(result.nutrients.fat, 33);
    assert.strictEqual(result.nutrients.saturatedFat, 13);
    assert.strictEqual(result.nutrients.carbohydrates, 55);
    assert.strictEqual(result.nutrients.sugars, 45);
    assert.strictEqual(result.nutrients.fiber, 2.4);
    assert.strictEqual(result.nutrients.protein, 6.8);
    assert.strictEqual(result.nutrients.salt, 0.18);
  });

  test("AC-2: should parse English nutrition label", () => {
    const text = `Nutrition Facts
Per 100 g  Per 30 g
Energy  2292 kJ  688 kJ
         549 kcal 165 kcal
Fat  33 g  10 g
of which saturates  13 g  3,9 g
Carbohydrate  55 g  16 g
of which sugars  45 g  14 g
Fibre  2,4 g  0,7 g
Protein  6,8 g  2,0 g
Salt  0,18 g  0,05 g`;

    const result = parseNutritionText(text);

    assert.strictEqual(result.nutrients.energyKj, 2292);
    assert.strictEqual(result.nutrients.energyKcal, 549);
    assert.strictEqual(result.nutrients.fat, 33);
    assert.strictEqual(result.nutrients.saturatedFat, 13);
    assert.strictEqual(result.nutrients.carbohydrates, 55);
    assert.strictEqual(result.nutrients.sugars, 45);
    assert.strictEqual(result.nutrients.fiber, 2.4);
    assert.strictEqual(result.nutrients.protein, 6.8);
    assert.strictEqual(result.nutrients.salt, 0.18);
  });

  test("AC-2: should handle missing values", () => {
    const text = `Energie  2292 kJ  688 kJ
         549 kcal 165 kcal
Fett     33 g     10 g`;

    const result = parseNutritionText(text);

    assert.strictEqual(result.nutrients.carbohydrates, undefined);
    assert.strictEqual(result.nutrients.sugars, undefined);
    assert.strictEqual(result.nutrients.fiber, undefined);
    assert.strictEqual(result.nutrients.protein, undefined);
    assert.strictEqual(result.nutrients.salt, undefined);
  });

  test("AC-2: should extract product name from header", () => {
    const text = `Melto Schokolade
Nährwertdeklaration
100 g    30 g = 1 Melto
Energie  2292 kJ  688 kJ`;

    const result = parseNutritionText(text);

    assert.strictEqual(result.productName, "Melto Schokolade");
  });

  test("AC-2: should handle comma as decimal separator", () => {
    const text = `Energie  2292 kJ  688 kJ
         549 kcal 165 kcal
Fett     33 g     10,5 g`;

    const result = parseNutritionText(text);

    assert.strictEqual(result.nutrients.fat, 33);
    assert.strictEqual(result.nutrients.fat, 33);
  });

  test("AC-2: should handle per 100ml format", () => {
    const text = `Voedingswaarde per 100 ml
energie  199 kJ / 47 kcal
vetten  0 g
koolhydraten  11 g
suikers  10 g
eiwitten  0,4 g
zout  0 g`;

    const result = parseNutritionText(text);

    assert.strictEqual(result.servingSize, "100 ml");
    assert.strictEqual(result.nutrients.energyKj, 199);
    assert.strictEqual(result.nutrients.energyKcal, 47);
    assert.strictEqual(result.nutrients.fat, 0);
    assert.strictEqual(result.nutrients.carbohydrates, 11);
    assert.strictEqual(result.nutrients.sugars, 10);
    assert.strictEqual(result.nutrients.protein, 0.4);
    assert.strictEqual(result.nutrients.salt, 0);
  });
});