/**
 * Frontend JavaScript for the Nutrition Scanner app.
 * Ties together OCR, parsing, calculation, and storage modules.
 */

import { extractNutritionFromImage } from "../src/ocr.js";
import { parseNutritionText } from "../src/parser.js";
import { calculateNutrients, calculateDailyTotal } from "../src/calculator.js";
import {
  saveProduct,
  getProducts,
  deleteProduct,
  saveMealPlan,
  getMealPlans,
  saveSettings,
  getSettings,
} from "../src/storage.js";
import { exportData, importData } from "../src/export.js";

// State
let currentParsedData = null;
let currentMealItems = [];
let currentMealName = "";

// DOM Elements
const apiKeyInput = document.getElementById("api-key");
const apiUrlInput = document.getElementById("api-url");
const saveSettingsBtn = document.getElementById("save-settings-btn");
const imageInput = document.getElementById("image-input");
const imagePreviewContainer = document.getElementById("image-preview-container");
const imagePreview = document.getElementById("image-preview");
const scanBtn = document.getElementById("scan-btn");
const scanStatus = document.getElementById("scan-status");
const ocrResult = document.getElementById("ocr-result");
const resultsSection = document.getElementById("results-section");
const productNameDisplay = document.getElementById("product-name-display");
const servingInfoDisplay = document.getElementById("serving-info-display");
const nutrientsBody = document.getElementById("nutrients-body");
const saveProductBtn = document.getElementById("save-product-btn");
const productsList = document.getElementById("products-list");
const mealNameInput = document.getElementById("meal-name");
const mealProductSelect = document.getElementById("meal-product");
const mealGramsInput = document.getElementById("meal-grams");
const addMealItemBtn = document.getElementById("add-meal-item-btn");
const mealItemsList = document.getElementById("meal-items-list");
const saveMealBtn = document.getElementById("save-meal-btn");
const dailySection = document.getElementById("daily-section");
const dailyBody = document.getElementById("daily-body");
const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importResult = document.getElementById("import-result");

// Load settings on startup
function loadSettings() {
  const settings = getSettings();
  apiKeyInput.value = settings.apiKey || "";
  apiUrlInput.value = settings.apiUrl || "https://api.openai.com/v1/chat/completions";
}

// Save settings
saveSettingsBtn.addEventListener("click", () => {
  const settings = {
    apiKey: apiKeyInput.value,
    apiUrl: apiUrlInput.value,
    preferredUnit: "metric",
    dailyCalorieGoal: 2000,
    dailySodiumGoal: 2300,
    dailyFatGoal: 65,
  };
  saveSettings(null, settings);
  alert("Settings saved!");
});

// Handle image upload
imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      imagePreview.src = event.target.result;
      imagePreviewContainer.classList.remove("hidden");
      scanBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  }
});

// Scan label
scanBtn.addEventListener("click", async () => {
  const apiKey = apiKeyInput.value;
  const apiUrl = apiUrlInput.value;

  if (!apiKey) {
    alert("Please enter your API key in Settings first.");
    return;
  }

  const file = imageInput.files[0];
  if (!file) {
    alert("Please select an image first.");
    return;
  }

  scanStatus.textContent = "Scanning...";
  scanStatus.classList.remove("hidden");
  scanBtn.disabled = true;

  try {
    const base64 = await readFileAsBase64(file);
    const ocrText = await extractNutritionFromImage(base64, apiUrl, apiKey);

    ocrResult.textContent = ocrText;
    ocrResult.classList.remove("hidden");

    // Parse the OCR text
    currentParsedData = parseNutritionText(ocrText);
    displayParsedData(currentParsedData);
  } catch (error) {
    scanStatus.textContent = `Error: ${error.message}`;
    scanStatus.classList.add("error");
  } finally {
    scanBtn.disabled = false;
  }
});

// Helper: read file as base64
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Display parsed data
function displayParsedData(data) {
  resultsSection.classList.remove("hidden");

  if (data.productName) {
    productNameDisplay.textContent = `Product: ${data.productName}`;
    productNameDisplay.classList.remove("hidden");
  } else {
    productNameDisplay.classList.add("hidden");
  }

  servingInfoDisplay.textContent = `Serving: ${data.servingSize} (${data.servingUnit})`;
  servingInfoDisplay.classList.remove("hidden");

  const nutrientLabels = {
    energyKj: "Energy (kJ)",
    energyKcal: "Energy (kcal)",
    fat: "Fat",
    saturatedFat: "Saturated Fat",
    carbohydrates: "Carbohydrates",
    sugars: "Sugars",
    fiber: "Fiber",
    protein: "Protein",
    salt: "Salt",
    sodium: "Sodium",
  };

  nutrientsBody.innerHTML = "";
  for (const [key, value] of Object.entries(data.nutrients)) {
    if (value !== undefined && value !== null) {
      const row = document.createElement("tr");
      const label = nutrientLabels[key] || key;
      row.innerHTML = `<td>${label}</td><td>${value} g</td>`;
      nutrientsBody.appendChild(row);
    }
  }
}

// Save product
saveProductBtn.addEventListener("click", () => {
  if (!currentParsedData) return;

  const product = {
    id: `product-${Date.now()}`,
    name: currentParsedData.productName || "Unknown Product",
    nutrients: currentParsedData.nutrients,
    servingSize: currentParsedData.servingSize,
    servingUnit: currentParsedData.servingUnit,
  };

  saveProduct(null, product);
  alert(`Product "${product.name}" saved!`);
  loadProducts();
  loadMealProducts();
});

// Load products list
function loadProducts() {
  const products = getProducts();
  productsList.innerHTML = "";

  if (products.length === 0) {
    productsList.innerHTML = "<p>No saved products yet.</p>";
    return;
  }

  products.forEach((product) => {
    const div = document.createElement("div");
    div.className = "product-item";
    div.innerHTML = `
      <strong>${product.name}</strong>
      <span>${product.servingSize}</span>
      <button class="btn btn-danger delete-product-btn" data-id="${product.id}">Delete</button>
    `;
    productsList.appendChild(div);
  });

  // Add delete handlers
  document.querySelectorAll(".delete-product-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      deleteProduct(null, btn.dataset.id);
      loadProducts();
      loadMealProducts();
    });
  });
}

// Load meal products dropdown
function loadMealProducts() {
  const products = getProducts();
  mealProductSelect.innerHTML = '<option value="">-- Select a product --</option>';

  products.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.id;
    option.textContent = `${product.name} (${product.servingSize})`;
    mealProductSelect.appendChild(option);
  });
}

// Add meal item
addMealItemBtn.addEventListener("click", () => {
  const productId = mealProductSelect.value;
  const grams = parseFloat(mealGramsInput.value);

  if (!productId || isNaN(grams) || grams <= 0) {
    alert("Please select a product and enter a valid amount.");
    return;
  }

  const products = getProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  // Parse serving size to get grams
  const servingMatch = product.servingSize.match(/(\d+(?:[.,]\d+)?)\s*(g|ml)/i);
  const servingGrams = servingMatch ? parseFloat(servingMatch[1].replace(",", ".")) : 100;

  const scaled = calculateNutrients(product.nutrients, servingGrams, grams);

  currentMealItems.push({
    productId,
    productName: product.name,
    grams,
    nutrients: scaled,
  });

  displayMealItems();
  calculateDailyTotalDisplay();
});

// Display meal items
function displayMealItems() {
  mealItemsList.innerHTML = "";

  currentMealItems.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "meal-item";
    div.innerHTML = `
      <span>${item.productName} - ${item.grams}g</span>
      <button class="btn btn-danger remove-item-btn" data-index="${index}">Remove</button>
    `;
    mealItemsList.appendChild(div);
  });

  document.querySelectorAll(".remove-item-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentMealItems.splice(parseInt(btn.dataset.index), 1);
      displayMealItems();
      calculateDailyTotalDisplay();
    });
  });
}

// Calculate and display daily total
function calculateDailyTotalDisplay() {
  if (currentMealItems.length === 0) {
    dailySection.classList.add("hidden");
    return;
  }

  dailySection.classList.remove("hidden");

  const totals = calculateDailyTotal(currentMealItems);

  dailyBody.innerHTML = "";
  const nutrientLabels = {
    energyKj: "Energy (kJ)",
    energyKcal: "Energy (kcal)",
    fat: "Fat",
    saturatedFat: "Saturated Fat",
    carbohydrates: "Carbohydrates",
    sugars: "Sugars",
    fiber: "Fiber",
    protein: "Protein",
    salt: "Salt",
  };

  for (const [key, value] of Object.entries(totals)) {
    const row = document.createElement("tr");
    const label = nutrientLabels[key] || key;
    row.innerHTML = `<td>${label}</td><td>${value}</td>`;
    dailyBody.appendChild(row);
  }
}

// Save meal
saveMealBtn.addEventListener("click", () => {
  currentMealName = mealNameInput.value || `Meal ${Date.now()}`;

  if (currentMealItems.length === 0) {
    alert("Add some items to the meal first.");
    return;
  }

  const mealPlan = {
    id: `meal-${Date.now()}`,
    name: currentMealName,
    date: new Date().toISOString().split("T")[0],
    items: currentMealItems.map((item) => ({
      productId: item.productId,
      grams: item.grams,
    })),
  };

  saveMealPlan(null, mealPlan);
  alert(`Meal "${currentMealName}" saved!`);

  // Reset
  currentMealItems = [];
  mealNameInput.value = "";
  mealGramsInput.value = "";
  displayMealItems();
  calculateDailyTotalDisplay();
});

// Export data
exportBtn.addEventListener("click", () => {
  const json = exportData();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nutrition-scanner-export-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

// Import data
importBtn.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const success = importData(null, event.target.result);
      if (success) {
        importResult.textContent = "Import successful!";
        importResult.classList.remove("hidden");
        importResult.classList.add("success");
        loadProducts();
        loadMealProducts();
      } else {
        importResult.textContent = "Import failed: invalid data format.";
        importResult.classList.remove("hidden");
        importResult.classList.add("error");
      }
    };
    reader.readAsText(file);
  };
  input.click();
});

// Initialize
loadSettings();
loadProducts();
loadMealProducts();