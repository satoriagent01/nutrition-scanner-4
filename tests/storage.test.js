import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  saveProduct,
  getProducts,
  deleteProduct,
  saveMealPlan,
  getMealPlans,
  saveSettings,
  getSettings,
} from "../src/storage.js";

describe("storage - product operations", () => {
  test("AC-5: should save a product", () => {
    const mockStorage = {};
    const product = {
      id: "product-1",
      name: "Melto Schokolade",
      nutrients: {
        energyKj: 2292,
        energyKcal: 549,
        fat: 33,
        carbohydrates: 55,
        sugars: 45,
        protein: 6.8,
        salt: 0.18,
      },
      servingSize: "30 g",
      servingUnit: "Melto",
    };

    saveProduct(mockStorage, product);

    assert.ok(mockStorage["product:product-1"]);
    assert.strictEqual(
      mockStorage["product:product-1"],
      JSON.stringify(product)
    );
  });

  test("AC-5: should get all products", () => {
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
    };

    const products = getProducts(mockStorage);

    assert.strictEqual(products.length, 2);
    assert.strictEqual(products[0].id, "product-1");
    assert.strictEqual(products[1].id, "product-2");
  });

  test("AC-5: should get empty array when no products", () => {
    const mockStorage = {};
    const products = getProducts(mockStorage);
    assert.strictEqual(products.length, 0);
  });

  test("AC-5: should delete a product", () => {
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
    };

    deleteProduct(mockStorage, "product-1");

    assert.ok(!mockStorage["product:product-1"]);
    assert.ok(mockStorage["product:product-2"]);
  });

  test("AC-5: should handle deleting non-existent product", () => {
    const mockStorage = {
      "product:product-1": JSON.stringify({
        id: "product-1",
        name: "Melto Schokolade",
        nutrients: { energyKj: 2292, energyKcal: 549, fat: 33 },
        servingSize: "30 g",
        servingUnit: "Melto",
      }),
    };

    // Should not throw
    deleteProduct(mockStorage, "non-existent");

    assert.ok(mockStorage["product:product-1"]);
  });
});

describe("storage - meal plan operations", () => {
  test("AC-5: should save a meal plan", () => {
    const mockStorage = {};
    const mealPlan = {
      id: "meal-1",
      name: "Breakfast",
      date: "2024-01-15",
      items: [
        {
          productId: "product-1",
          grams: 60,
        },
      ],
    };

    saveMealPlan(mockStorage, mealPlan);

    assert.ok(mockStorage["mealplan:meal-1"]);
    assert.strictEqual(
      mockStorage["mealplan:meal-1"],
      JSON.stringify(mealPlan)
    );
  });

  test("AC-5: should get all meal plans", () => {
    const mockStorage = {
      "mealplan:meal-1": JSON.stringify({
        id: "meal-1",
        name: "Breakfast",
        date: "2024-01-15",
        items: [{ productId: "product-1", grams: 60 }],
      }),
      "mealplan:meal-2": JSON.stringify({
        id: "meal-2",
        name: "Lunch",
        date: "2024-01-15",
        items: [{ productId: "product-2", grams: 200 }],
      }),
    };

    const mealPlans = getMealPlans(mockStorage);

    assert.strictEqual(mealPlans.length, 2);
    assert.strictEqual(mealPlans[0].id, "meal-1");
    assert.strictEqual(mealPlans[1].id, "meal-2");
  });

  test("AC-5: should get empty array when no meal plans", () => {
    const mockStorage = {};
    const mealPlans = getMealPlans(mockStorage);
    assert.strictEqual(mealPlans.length, 0);
  });
});

describe("storage - settings operations", () => {
  test("AC-5: should save settings", () => {
    const mockStorage = {};
    const settings = {
      preferredUnit: "metric",
      dailyCalorieGoal: 2000,
      dailySodiumGoal: 2300,
      dailyFatGoal: 65,
    };

    saveSettings(mockStorage, settings);

    assert.ok(mockStorage["settings:default"]);
    assert.strictEqual(
      mockStorage["settings:default"],
      JSON.stringify(settings)
    );
  });

  test("AC-5: should get settings", () => {
    const mockStorage = {
      "settings:default": JSON.stringify({
        preferredUnit: "metric",
        dailyCalorieGoal: 2000,
        dailySodiumGoal: 2300,
        dailyFatGoal: 65,
      }),
    };

    const settings = getSettings(mockStorage);

    assert.strictEqual(settings.preferredUnit, "metric");
    assert.strictEqual(settings.dailyCalorieGoal, 2000);
    assert.strictEqual(settings.dailySodiumGoal, 2300);
    assert.strictEqual(settings.dailyFatGoal, 65);
  });

  test("AC-5: should return default settings when none saved", () => {
    const mockStorage = {};
    const settings = getSettings(mockStorage);

    assert.strictEqual(settings.preferredUnit, "metric");
    assert.strictEqual(settings.dailyCalorieGoal, 2000);
  });
});