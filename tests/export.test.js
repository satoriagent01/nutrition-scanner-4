import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { exportData, importData } from "../src/export.js";

describe("export - exportData", () => {
  test("AC-6: should export all user data as JSON string", () => {
    const mockStorage = {
      "product:product-1": JSON.stringify({
        id: "product-1",
        name: "Melto Schokolade",
        nutrients: { energyKj: 2292, energyKcal: 549, fat: 33 },
        servingSize: "30 g",
        servingUnit: "Melto",
      }),
      "product:product-2": JSON.stringify({
        id: "product-2",
        name: "Apple Juice",
        nutrients: { energyKj: 199, energyKcal: 47, fat: 0 },
        servingSize: "100 ml",
        servingUnit: "ml",
      }),
      "mealplan:meal-1": JSON.stringify({
        id: "meal-1",
        name: "Breakfast",
        date: "2024-01-15",
        items: [{ productId: "product-1", grams: 60 }],
      }),
      "settings:default": JSON.stringify({
        preferredUnit: "metric",
        dailyCalorieGoal: 2000,
        dailySodiumGoal: 2300,
        dailyFatGoal: 65,
      }),
    };

    const exported = exportData(mockStorage);

    assert.ok(typeof exported === "string");
    const parsed = JSON.parse(exported);

    assert.ok(parsed.products);
    assert.ok(parsed.mealPlans);
    assert.ok(parsed.settings);
    assert.strictEqual(parsed.products.length, 2);
    assert.strictEqual(parsed.mealPlans.length, 1);
    assert.strictEqual(parsed.settings.preferredUnit, "metric");
  });

  test("AC-6: should export empty data when no data exists", () => {
    const mockStorage = {};

    const exported = exportData(mockStorage);

    const parsed = JSON.parse(exported);

    assert.ok(parsed.products);
    assert.ok(parsed.mealPlans);
    assert.ok(parsed.settings);
    assert.strictEqual(parsed.products.length, 0);
    assert.strictEqual(parsed.mealPlans.length, 0);
  });

  test("AC-6: should include all product fields in export", () => {
    const mockStorage = {
      "product:product-1": JSON.stringify({
        id: "product-1",
        name: "Melto Schokolade",
        nutrients: {
          energyKj: 2292,
          energyKcal: 549,
          fat: 33,
          saturatedFat: 13,
          carbohydrates: 55,
          sugars: 45,
          fiber: 2.4,
          protein: 6.8,
          salt: 0.18,
        },
        servingSize: "30 g",
        servingUnit: "Melto",
      }),
    };

    const exported = exportData(mockStorage);
    const parsed = JSON.parse(exported);

    const product = parsed.products[0];
    assert.strictEqual(product.id, "product-1");
    assert.strictEqual(product.name, "Melto Schokolade");
    assert.strictEqual(product.nutrients.energyKj, 2292);
    assert.strictEqual(product.nutrients.saturatedFat, 13);
    assert.strictEqual(product.nutrients.fiber, 2.4);
    assert.strictEqual(product.servingSize, "30 g");
    assert.strictEqual(product.servingUnit, "Melto");
  });
});

describe("export - importData", () => {
  test("AC-6: should import valid JSON data", () => {
    const mockStorage = {};
    const jsonData = JSON.stringify({
      products: [
        {
          id: "product-1",
          name: "Melto Schokolade",
          nutrients: { energyKj: 2292, energyKcal: 549, fat: 33 },
          servingSize: "30 g",
          servingUnit: "Melto",
        },
      ],
      mealPlans: [
        {
          id: "meal-1",
          name: "Breakfast",
          date: "2024-01-15",
          items: [{ productId: "product-1", grams: 60 }],
        },
      ],
      settings: {
        preferredUnit: "metric",
        dailyCalorieGoal: 2000,
      },
    });

    const result = importData(mockStorage, jsonData);

    assert.strictEqual(result, true);
    assert.ok(mockStorage["product:product-1"]);
    assert.ok(mockStorage["mealplan:meal-1"]);
    assert.ok(mockStorage["settings:default"]);
  });

  test("AC-6: should return false for invalid JSON", () => {
    const mockStorage = {};

    const result = importData(mockStorage, "not valid json");

    assert.strictEqual(result, false);
  });

  test("AC-6: should return false for malformed data structure", () => {
    const mockStorage = {};
    const jsonData = JSON.stringify({
      products: "not an array",
      mealPlans: [],
      settings: {},
    });

    const result = importData(mockStorage, jsonData);

    assert.strictEqual(result, false);
  });

  test("AC-6: should overwrite existing data on import", () => {
    const mockStorage = {
      "product:old-product": JSON.stringify({
        id: "old-product",
        name: "Old Product",
        nutrients: { energyKj: 100, energyKcal: 200, fat: 5 },
        servingSize: "50 g",
        servingUnit: "g",
      }),
    };

    const jsonData = JSON.stringify({
      products: [
        {
          id: "new-product",
          name: "New Product",
          nutrients: { energyKj: 300, energyKcal: 400, fat: 10 },
          servingSize: "25 g",
          servingUnit: "g",
        },
      ],
      mealPlans: [],
      settings: { preferredUnit: "imperial" },
    });

    const result = importData(mockStorage, jsonData);

    assert.strictEqual(result, true);
    assert.ok(!mockStorage["product:old-product"]);
    assert.ok(mockStorage["product:new-product"]);
    assert.strictEqual(
      JSON.parse(mockStorage["product:new-product"]).name,
      "New Product"
    );
  });

  test("AC-6: should import empty data correctly", () => {
    const mockStorage = {
      "product:existing": JSON.stringify({
        id: "existing",
        name: "Existing",
        nutrients: { energyKj: 100, energyKcal: 200, fat: 5 },
        servingSize: "50 g",
        servingUnit: "g",
      }),
    };

    const jsonData = JSON.stringify({
      products: [],
      mealPlans: [],
      settings: {},
    });

    const result = importData(mockStorage, jsonData);

    assert.strictEqual(result, true);
    assert.ok(!mockStorage["product:existing"]);
  });

  test("AC-6: should handle import with only products", () => {
    const mockStorage = {};
    const jsonData = JSON.stringify({
      products: [
        {
          id: "product-1",
          name: "Test Product",
          nutrients: { energyKj: 500, energyKcal: 100, fat: 5 },
          servingSize: "100 g",
          servingUnit: "g",
        },
      ],
      mealPlans: [],
      settings: {},
    });

    const result = importData(mockStorage, jsonData);

    assert.strictEqual(result, true);
    assert.ok(mockStorage["product:product-1"]);
    assert.ok(mockStorage["settings:default"]);
  });
});