/**
 * Frontend JavaScript for Nutrition Scanner
 * Ties together OCR, parsing, calculation, and storage
 */

import { extractNutritionFromImage } from '../src/ocr.js';
import { parseNutritionText } from '../src/parser.js';
import { calculateNutrients, calculateDailyTotal } from '../src/calculator.js';
import { saveProduct, getProducts, deleteProduct, saveMealPlan, getMealPlans, saveSettings, getSettings } from '../src/storage.js';
import { exportData, importData } from '../src/export.js';

// State
let currentImageBase64 = null;
let currentParsedNutrients = null;
let currentProductName = '';
let currentServingSize = 0;
let currentServingUnit = 'g';
let mealItems = [];
let trackedNutrients = [];

// DOM Elements
const apiUrlInput = document.getElementById('api-url');
const apiKeyInput = document.getElementById('api-key');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const takePhotoBtn = document.getElementById('take-photo-btn');
const uploadPhotoBtn = document.getElementById('upload-photo-btn');
const fileInput = document.getElementById('file-input');
const previewContainer = document.getElementById('preview-container');
const previewImage = document.getElementById('preview-image');
const scanBtn = document.getElementById('scan-btn');
const clearPhotoBtn = document.getElementById('clear-photo-btn');
const ocrResult = document.getElementById('ocr-result');
const ocrText = document.getElementById('ocr-text');
const parsedResult = document.getElementById('parsed-result');
const parsedData = document.getElementById('parsed-data');
const saveProductBtn = document.getElementById('save-product-btn');
const productsList = document.getElementById('products-list');
const mealItemsDiv = document.getElementById('meal-items');
const addMealItemBtn = document.getElementById('add-meal-item-btn');
const mealTotal = document.getElementById('meal-total');
const mealTotalData = document.getElementById('meal-total-data');
const trackNutrientInput = document.getElementById('track-nutrient');
const addTrackBtn = document.getElementById('add-track-btn');
const trackingList = document.getElementById('tracking-list');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFileInput = document.getElementById('import-file-input');
const importStatus = document.getElementById('import-status');

// Initialize
function init() {
  const settings = getSettings();
  if (settings.apiUrl) apiUrlInput.value = settings.apiUrl;
  if (settings.apiKey) apiKeyInput.value = settings.apiKey;
  if (settings.trackedNutrients) trackedNutrients = settings.trackedNutrients;

  loadProducts();
  loadMealItems();
  renderTracking();
}

// Settings
saveSettingsBtn.addEventListener('click', () => {
  const settings = {
    apiUrl: apiUrlInput.value,
    apiKey: apiKeyInput.value,
    trackedNutrients: trackedNutrients
  };
  saveSettings(settings);
  alert('Settings saved!');
});

// Photo capture
takePhotoBtn.addEventListener('click', () => {
  fileInput.click();
});

uploadPhotoBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      currentImageBase64 = event.target.result;
      previewImage.src = currentImageBase64;
      previewContainer.classList.remove('hidden');
      ocrResult.classList.add('hidden');
      parsedResult.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  }
});

// Scan with AI
scanBtn.addEventListener('click', async () => {
  if (!currentImageBase64) return;

  const settings = getSettings();
  const apiUrl = settings.apiUrl || 'https://api.openai.com/v1/chat/completions';
  const apiKey = settings.apiKey;

  if (!apiKey) {
    alert('Please set your API key in Settings first.');
    return;
  }

  scanBtn.textContent = 'Scanning...';
  scanBtn.disabled = true;

  try {
    const prompt = `Extract all nutrition information from this label. Return ONLY the raw text exactly as it appears, including all numbers, units, and labels. Do not add any commentary or formatting.`;

    const extractedText = await extractNutritionFromImage(currentImageBase64, apiUrl, apiKey, prompt);

    ocrText.textContent = extractedText;
    ocrResult.classList.remove('hidden');

    // Parse the extracted text
    const parsed = parseNutritionText(extractedText);
    currentParsedNutrients = parsed.nutrients;
    currentProductName = parsed.productName || 'Unknown Product';
    currentServingSize = parsed.servingSize || 100;
    currentServingUnit = parsed.servingUnit || 'g';

    displayParsedNutrients(parsed);
    parsedResult.classList.remove('hidden');
  } catch (error) {
    alert('Error scanning: ' + error.message);
  } finally {
    scanBtn.textContent = 'Scan with AI';
    scanBtn.disabled = false;
  }
});

function displayParsedNutrients(parsed) {
  const nutrients = parsed.nutrients || {};
  let html = `<h4>${parsed.productName || 'Unknown Product'}</h4>`;
  html += `<p>Serving: ${parsed.servingSize} ${parsed.servingUnit || 'g'}</p>`;
  html += '<ul>';

  const nutrientLabels = {
    energyKj: 'Energy (kJ)',
    energyKcal: 'Energy (kcal)',
    fat: 'Fat',
    saturatedFat: 'Saturated Fat',
    carbohydrates: 'Carbohydrates',
    sugars: 'Sugars',
    fiber: 'Fiber',
    protein: 'Protein',
    salt: 'Salt',
    sodium: 'Sodium'
  };

  for (const [key, label] of Object.entries(nutrientLabels)) {
    if (nutrients[key] !== undefined) {
      html += `<li><strong>${label}:</strong> ${nutrients[key]} ${key.includes('Kcal') || key.includes('Kj') ? '' : 'g'}</li>`;
    }
  }

  html += '</ul>';
  parsedData.innerHTML = html;
}

// Save product
saveProductBtn.addEventListener('click', () => {
  if (!currentParsedNutrients) return;

  const product = {
    id: Date.now().toString(),
    name: currentProductName,
    servingSize: currentServingSize,
    servingUnit: currentServingUnit,
    nutrients: { ...currentParsedNutrients },
    savedAt: new Date().toISOString()
  };

  saveProduct(product);
  alert(`Product "${product.name}" saved!`);
  loadProducts();
});

// Load products
function loadProducts() {
  const products = getProducts();
  if (products.length === 0) {
    productsList.innerHTML = '<p>No products saved yet.</p>';
    return;
  }

  let html = '';
  products.forEach(product => {
    html += `<div class="product-item">
      <h4>${product.name}</h4>
      <p>Serving: ${product.servingSize} ${product.servingUnit || 'g'}</p>
      <ul>`;

    const nutrientLabels = {
      energyKj: 'Energy (kJ)',
      energyKcal: 'Energy (kcal)',
      fat: 'Fat',
      saturatedFat: 'Saturated Fat',
      carbohydrates: 'Carbohydrates',
      sugars: 'Sugars',
      fiber: 'Fiber',
      protein: 'Protein',
      salt: 'Salt',
      sodium: 'Sodium'
    };

    for (const [key, label] of Object.entries(nutrientLabels)) {
      if (product.nutrients && product.nutrients[key] !== undefined) {
        html += `<li>${label}: ${product.nutrients[key]} ${key.includes('Kcal') || key.includes('Kj') ? '' : 'g'}</li>`;
      }
    }

    html += `</ul>
      <button class="delete-btn" data-id="${product.id}">Delete</button>
    </div>`;
  });

  productsList.innerHTML = html;

  // Add delete handlers
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteProduct(btn.dataset.id);
      loadProducts();
    });
  });
}

// Meal planner
addMealItemBtn.addEventListener('click', () => {
  const products = getProducts();
  if (products.length === 0) {
    alert('Save some products first!');
    return;
  }

  let options = products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

  const itemDiv = document.createElement('div');
  itemDiv.className = 'meal-item';
  itemDiv.innerHTML = `
    <select class="meal-product-select">${options}</select>
    <input type="number" class="meal-grams" placeholder="Grams" min="0" step="1">
    <button class="remove-meal-item">Remove</button>
  `;

  mealItemsDiv.appendChild(itemDiv);

  // Add remove handler
  itemDiv.querySelector('.remove-meal-item').addEventListener('click', () => {
    itemDiv.remove();
    updateMealTotal();
  });

  // Add change handlers
  itemDiv.querySelector('.meal-product-select').addEventListener('change', updateMealTotal);
  itemDiv.querySelector('.meal-grams').addEventListener('input', updateMealTotal);

  updateMealTotal();
});

function updateMealTotal() {
  const items = mealItemsDiv.querySelectorAll('.meal-item');
  const mealItemsData = [];

  items.forEach(item => {
    const productId = item.querySelector('.meal-product-select').value;
    const grams = parseFloat(item.querySelector('.meal-grams').value) || 0;

    if (productId && grams > 0) {
      const products = getProducts();
      const product = products.find(p => p.id === productId);
      if (product) {
        mealItemsData.push({
          product,
          grams
        });
      }
    }
  });

  if (mealItemsData.length === 0) {
    mealTotal.classList.add('hidden');
    return;
  }

  mealTotal.classList.remove('hidden');

  const total = calculateDailyTotal(mealItemsData);
  let html = '<ul>';

  const nutrientLabels = {
    energyKj: 'Energy (kJ)',
    energyKcal: 'Energy (kcal)',
    fat: 'Fat',
    saturatedFat: 'Saturated Fat',
    carbohydrates: 'Carbohydrates',
    sugars: 'Sugars',
    fiber: 'Fiber',
    protein: 'Protein',
    salt: 'Salt',
    sodium: 'Sodium'
  };

  for (const [key, label] of Object.entries(nutrientLabels)) {
    if (total[key] !== undefined) {
      html += `<li><strong>${label}:</strong> ${total[key].toFixed(1)} ${key.includes('Kcal') || key.includes('Kj') ? '' : 'g'}</li>`;
    }
  }

  html += '</ul>';
  mealTotalData.innerHTML = html;
}

// Custom tracking
addTrackBtn.addEventListener('click', () => {
  const nutrient = trackNutrientInput.value.trim().toLowerCase();
  if (nutrient && !trackedNutrients.includes(nutrient)) {
    trackedNutrients.push(nutrient);
    const settings = getSettings();
    settings.trackedNutrients = trackedNutrients;
    saveSettings(settings);
    trackNutrientInput.value = '';
    renderTracking();
  }
});

function renderTracking() {
  if (trackedNutrients.length === 0) {
    trackingList.innerHTML = '<p>No nutrients being tracked. Add one above!</p>';
    return;
  }

  let html = '<ul>';
  trackedNutrients.forEach(nutrient => {
    html += `<li>${nutrient} <button class="remove-track-btn" data-nutrient="${nutrient}">Remove</button></li>`;
  });
  html += '</ul>';
  trackingList.innerHTML = html;

  document.querySelectorAll('.remove-track-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      trackedNutrients = trackedNutrients.filter(n => n !== btn.dataset.nutrient);
      const settings = getSettings();
      settings.trackedNutrients = trackedNutrients;
      saveSettings(settings);
      renderTracking();
    });
  });
}

// Export/Import
exportBtn.addEventListener('click', () => {
  const data = exportData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'nutrition-scanner-data.json';
  a.click();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', () => {
  importFileInput.click();
});

importFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const success = importData(event.target.result);
      if (success) {
        importStatus.textContent = 'Import successful!';
        importStatus.style.color = 'green';
        loadProducts();
        loadMealItems();
        renderTracking();
      } else {
        importStatus.textContent = 'Import failed: Invalid data';
        importStatus.style.color = 'red';
      }
    };
    reader.readAsText(file);
  }
  importFileInput.value = '';
});

// Clear photo
clearPhotoBtn.addEventListener('click', () => {
  currentImageBase64 = null;
  currentParsedNutrients = null;
  previewImage.src = '';
  previewContainer.classList.add('hidden');
  ocrResult.classList.add('hidden');
  parsedResult.classList.add('hidden');
  fileInput.value = '';
});

// Load meal items from storage
function loadMealItems() {
  // For simplicity, meal items are not persisted between sessions
  // Users need to add them each time
  mealItemsDiv.innerHTML = '';
}

// Initialize on load
init();