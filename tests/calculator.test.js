import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateNutrients, calculateDailyTotal } from "../src/calculator.js";

describe("calculator - calculateNutrients", () => {
  test("AC-3: should scale nutrients from serving size to arbitrary grams", () => {
    const productNutrients = {
      energyKj: 2292,
      energyKcal: 549,
      fat: 33,
      saturatedFat: 13,
      carbohydrates: 55,
      sugars: 45,
      fiber: 2.4,
      protein: 6.8,
      salt: 0.18,
    };

    // Serving is 30g, scaling to 60g (2x)
    const result = calculateNutrients(productNutrients, 30, 60);

    assert.strictEqual(result.energyKj, 4584);
    assert.strictEqual(result.energyKcal, 1098);
    assert.strictEqual(result.fat, 66);
    assert.strictEqual(result.saturatedFat, 26);
    assert.strictEqual(result.carbohydrates, 110);
    assert.strictEqual(result.sugars, 90);
    assert.strictEqual(result.fiber, 4.8);
    assert.strictEqual(result.protein, 13.6);
    assert.strictEqual(result.salt, 0.36);
  });

  test("AC-3: should scale nutrients to half serving size", () => {
    const productNutrients = {
      energyKj: 2292,
      energyKcal: 549,
      fat: 33,
      carbohydrates: 55,
      protein: 6.8,
    };

    // Serving is 30g, scaling to 15g (0.5x)
    const result = calculateNutrients(productNutrients, 30, 15);

    assert.strictEqual(result.energyKj, 1146);
    assert.strictEqual(result.energyKcal, 274.5);
    assert.strictEqual(result.fat, 16.5);
    assert.strictEqual(result.carbohydrates, 27.5);
    assert.strictEqual(result.protein, 3.4);
  });

  test("AC-3: should handle 1:1 scaling (same as serving)", () => {
    const productNutrients = {
      energyKj: 2292,
      energyKcal: 549,
      fat: 33,
    };

    const result = calculateNutrients(productNutrients, 30, 30);

    assert.strictEqual(result.energyKj, 2292);
    assert.strictEqual(result.energyKcal, 549);
    assert.strictEqual(result.fat, 33);
  });

  test("AC-3: should handle per 100g serving", () => {
    const productNutrients = {
      energyKj: 199,
      energyKcal: 47,
      fat: 0,
      carbohydrates: 11,
      sugars: 10,
      protein: 0.4,
      salt: 0,
    };

    // Serving is 100ml, scaling to 200ml
    const result = calculateNutrients(productNutrients, 100, 200);

    assert.strictEqual(result.energyKj, 398);
    assert.strictEqual(result.energyKcal, 94);
    assert.strictEqual(result.fat, 0);
    assert.strictEqual(result.carbohydrates, 22);
    assert.strictEqual(result.sugars, 20);
    assert.strictEqual(result.protein, 0.8);
    assert.strictEqual(result.salt, 0);
  });

  test("AC-3: should handle missing nutrients gracefully", () => {
    const productNutrients = {
      energyKj: 2292,
      energyKcal: 549,
      fat: 33,
    };

    const result = calculateNutrients(productNutrients, 30, 60);

    assert.strictEqual(result.energyKj, 4584);
    assert.strictEqual(result.energyKcal, 1098);
    assert.strictEqual(result.fat, 66);
    assert.strictEqual(result.carbohydrates, undefined);
    assert.strictEqual(result.sugars, undefined);
  });

  test("AC-3: should handle decimal gram amounts", () => {
    const productNutrients = {
      energyKj: 2292,
      energyKcal: 549,
      fat: 33,
    };

    // Serving is 30g, scaling to 45g (1.5x)
    const result = calculateNutrients(productNutrients, 30, 45);

    assert.strictEqual(result.energyKj, 3438);
    assert.strictEqual(result.energyKcal, 823.5);
    assert.strictEqual(result.fat, 49.5);
  });
});

describe("calculator - calculateDailyTotal", () => {
  test("AC-4: should sum nutrients across multiple meal items", () => {
    const mealItems = [
      {
        productNutrients: {
          energyKj: 2292,
          energyKcal: 549,
          fat: 33,
          carbohydrates: 55,
          sugars: 45,
          protein: 6.8,
          salt: 0.18,
        },
        servingSize: 30,
        grams: 60,
      },
      {
        productNutrients: {
          energyKj: 199,
          energyKcal: 47,
          fat: 0,
          carbohydrates: 11,
          sugars: 10,
          protein: 0.4,
          salt: 0,
        },
        servingSize: 100,
        grams: 200,
      },
    ];

    const result = calculateDailyTotal(mealItems);

    // Item 1: 60g from 30g serving = 2x
    // energyKj: 2292 * 2 = 4584, energyKcal: 549 * 2 = 1098
    // fat: 33 * 2 = 66, carbs: 55 * 2 = 110, sugars: 45 * 2 = 90
    // protein: 6.8 * 2 = 13.6, salt: 0.18 * 2 = 0.36

    // Item 2: 200ml from 100ml serving = 2x
    // energyKj: 199 * 2 = 398, energyKcal: 47 * 2 = 94
    // fat: 0 * 2 = 0, carbs: 11 * 2 = 22, sugars: 10 * 2 = 20
    // protein: 0.4 * 2 = 0.8, salt: 0 * 2 = 0

    // Total:
    assert.strictEqual(result.energyKj, 4584 + 398);
    assert.strictEqual(result.energyKcal, 1098 + 94);
    assert.strictEqual(result.fat, 66 + 0);
    assert.strictEqual(result.carbohydrates, 110 + 22);
    assert.strictEqual(result.sugars, 90 + 20);
    assert.strictEqual(result.protein, 13.6 + 0.8);
    assert.strictEqual(result.salt, 0.36 + 0);
  });

  test("AC-4: should handle empty meal", () => {
    const mealItems = [];
    const result = calculateDailyTotal(mealItems);

    assert.deepStrictEqual(result, {});
  });

  test("AC-4: should handle single meal item", () => {
    const mealItems = [
      {
        productNutrients: {
          energyKj: 2292,
          energyKcal: 549,
          fat: 33,
        },
        servingSize: 30,
        grams: 30,
      },
    ];

    const result = calculateDailyTotal(mealItems);

    assert.strictEqual(result.energyKj, 2292);
    assert.strictEqual(result.energyKcal, 549);
    assert.strictEqual(result.fat, 33);
  });

  test("AC-4: should include all nutrients present across items", () => {
    const mealItems = [
      {
        productNutrients: {
          energyKj: 2292,
          energyKcal: 549,
          fat: 33,
        },
        servingSize: 30,
        grams: 30,
      },
      {
        productNutrients: {
          carbohydrates: 55,
          sugars: 45,
          protein: 6.8,
        },
        servingSize: 100,
        grams: 100,
      },
    ];

    const result = calculateDailyTotal(mealItems);

    assert.strictEqual(result.energyKj, 2292);
    assert.strictEqual(result.energyKcal, 549);
    assert.strictEqual(result.fat, 33);
    assert.strictEqual(result.carbohydrates, 55);
    assert.strictEqual(result.sugars, 45);
    assert.strictEqual(result.protein, 6.8);
  });
});