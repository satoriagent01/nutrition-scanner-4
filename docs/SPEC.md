# Nutrition Scanner - Product Specification

## Product Overview

A free, ad-free web application that allows users to photograph nutrition labels from food products, extract the nutritional information using OCR with AI, and then create custom meal plans with personalized nutrition tracking. The app supports multiple languages (German, French, Dutch, Italian, Spanish, English, etc.) and lets users track any nutrients they care about - not just calories, but sodium, saturated fats, sugars, and custom metrics.

## Examples from Shared Images

### Image 1 (1.jpg) - Chocolate Bar (Multi-language label)
- **Product**: Dr. Schär AG chocolate bar (gluten-free wafers with hazelnuts)
- **Languages**: German, French, Dutch, Italian
- **Nutrition Table Structure**:
  - Columns: "100 g" and "30 g = 1 Melto"
  - Rows: Energie (2292 kJ / 549 kcal per 100g), Fett (33 g), davon gesättigte Fettsäuren (13 g), Kohlenhydrate (55 g), davon Zucker (45 g), Ballaststoffe (2.4 g), Eiweiß (6.8 g), Salz (0.18 g)
- **Key fields**: Energy in both kJ and kcal, fat breakdown, carbohydrates with sugar sub-item, fiber, protein, salt

### Image 2 (2.jpg) - Juice Bottle (Dutch label)
- **Product**: Versgeperst appel-sinaasappel- en mangosap (Fresh pressed apple-orange-mango juice)
- **Language**: Dutch
- **Nutrition Table Structure**:
  - Columns: "100 ml" and "glas (200 ml)"
  - Rows: energie (199 kJ / 47 kcal per 100ml), vetten (0 g), waarvan verzadigde vetzuren (0 g), koolhydraten (11 g), waarvan suikers (10 g), waarvan vezels (0.7 g), eiwitten (0.4 g), zout (0 g)
  - Additional: Percentage of daily reference intake for vitamine C (26% per 100ml, 21 mg)
  - Per glass summary: 399 kJ / 94 kcal, 22 g carbs, 20 g sugars
- **Key fields**: Volume-based serving (ml), vitamin C percentage, per-glass summary

### Image 3 (3.jpg) - Olive Oil Spray (Dutch label)
- **Product**: Extra olijfolie van de eerste persing (Extra virgin olive oil spray)
- **Language**: Dutch
- **Nutrition Table Structure**:
  - Single column: "per 100 ml"
  - Rows: energie (3404 kJ / 828 kcal), vetten (92 g), waarvan verzadigde vetzuren (14 g), koolhydraten (0 g), waarvan suikers (0 g), vezels (0 g), eiwitten (0 g), zout (0 g)
  - Additional: vitamine E 150% of daily reference (8 mg)
  - Reference intake: 8400 kJ / 2000 kcal per day
- **Key fields**: Single serving column, high fat content, vitamin E percentage

## Acceptance Criteria

### AC-1: Photo Capture & Upload
- Users can capture a photo using their device camera OR upload an existing image file
- The app accepts common image formats (JPEG, PNG)
- After capture/upload, the image is displayed for review before processing

### AC-2: OCR with AI Extraction
- The app sends the captured/selected image to an OpenAI-compatible OCR endpoint
- The user configures their own API URL and key (stored locally in the browser)
- The AI extracts all text from the nutrition label image
- The extraction handles multi-language labels (German, French, Dutch, Italian, Spanish, English)
- The OCR result is displayed to the user for review/editing

### AC-3: Nutrition Data Parsing
- The app parses the extracted text to identify:
  - Product name (if present)
  - Serving size (e.g., "100 g", "30 g = 1 Melto", "100 ml", "glas (200 ml)")
  - Nutrients: energy (kJ and kcal), fat (vetten/fett), saturated fat (davon gesättigte Fettsäuren/verzadigde vetzuren), carbohydrates (koolhydraten/Kohlenhydrate), sugars (suikers/Zucker), fiber (vezels/Ballaststoffe), protein (eiwitten/Eiweiß), salt/sodium (zout/Salz)
  - Vitamins/minerals if present (e.g., vitamine C, vitamine E)
  - Percentage of daily reference intake if present
- The parsed data is presented in a structured format for user review
- Users can edit any value before saving

### AC-4: Product Saving
- Users can save parsed nutrition data as a product/food item
- Each saved product includes: name, serving size, serving unit, and all nutrient values per serving
- Products are stored in the browser's localStorage
- Users can view, edit, and delete their saved products

### AC-5: Meal Planning
- Users can create meal plans by adding saved products with custom gram amounts
- Users specify the amount in grams for each product in a meal
- The app calculates the actual nutritional values based on the specified grams vs. the product's serving size
- Users can create multiple meals (breakfast, lunch, dinner, snacks)

### AC-6: Custom Nutrition Tracking
- Users can select which nutrients to track (calories, sodium, saturated fats, sugars, etc.)
- The app displays a summary of total nutrition for each meal and daily totals
- Users can see the breakdown of each nutrient across all meals
- The app supports tracking any nutrient that was parsed from the label

### AC-7: Multi-language Support
- The UI supports at least English and Spanish (based on the conversation language)
- The OCR and parsing handle labels in German, French, Dutch, Italian, Spanish, and English
- Nutrient names are normalized internally regardless of the source language

### AC-8: Free & No Ads
- The application is completely free to use
- No advertisements or sponsored content
- No paywalls for features

### AC-9: Responsive UI
- The app works on both desktop and mobile devices
- The camera capture works on mobile devices
- The UI is clean and easy to use

## Technical Requirements

### Stack
- **Runtime**: Node 24 with ES modules (no build step)
- **Testing**: Node's built-in test runner (`node --test`)
- **Frontend**: Static web page in `public/` directory
- **Backend**: None - the app runs entirely in the browser
- **AI/OCR**: OpenAI-compatible endpoint (user-configured URL and API key)
- **Storage**: Browser localStorage for products, meal plans, and API configuration

### AI Integration
- The app calls an OpenAI-compatible endpoint (e.g., `https://api.openai.com/v1/chat/completions` or any compatible service)
- The user provides their own API URL and key, configured in the app settings
- The AI is prompted to extract structured nutrition data from the image
- The tests never call the AI endpoint - they use mock data

### Data Storage
- Products, meal plans, and settings are stored in localStorage
- Data persists across browser sessions
- Users can export/import their data as JSON

## Modules

### `src/ocr.js` - OCR with AI
- **Function**: `extractNutritionFromImage(imageBase64, apiUrl, apiKey)`
  - **Parameters**: 
    - `imageBase64`: Base64-encoded image string
    - `apiKey`: OpenAI-compatible API key
    - `apiUrl`: OpenAI-compatible API endpoint URL
  - **Returns**: `Promise<string>` - the raw text extracted from the image
  - **Example**: Sends a nutrition label image to the AI and returns the extracted text

### `src/parser.js` - Nutrition Text Parser
- **Function**: `parseNutritionText(text)`
  - **Parameters**: 
    - `text`: The raw text extracted by OCR
  - **Returns**: `Object` with structure:
    ```javascript
    {
      productName: string | null,
      servingSize: number,  // e.g., 100
      servingUnit: string,  // e.g., "g" or "ml"
      nutrients: {
        energyKj: number,
        energyKcal: number,
        fat: number,
        saturatedFat: number,
        carbohydrates: number,
        sugars: number,
        fiber: number,
        protein: number,
        salt: number,
        sodium: number | null,  // if separately listed
        vitamins: { [name]: { value: number, unit: string, dailyPercentage: number } }
      }
    }
    ```
  - **Example**:
    ```javascript
    // Input (from Image 1, per 100g):
    // "Nährwertdeklaration ... Energie 2292 kJ 549 kcal ... Fett 33 g ... davon gesättigte Fettsäuren 13 g ... Kohlenhydrate 55 g ... davon Zucker 45 g ... Ballaststoffe 2,4 g ... Eiweiß 6,8 g ... Salz 0,18 g"
    
    // Output:
    {
      productName: "Dr. Schär Schokolade",
      servingSize: 100,
      servingUnit: "g",
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
        sodium: null,
        vitamins: {}
      }
    }
    ```

  - **Example 2** (from Image 2, per 100ml):
    ```javascript
    // Input (from Image 2):
    // "Voedingswaarde per 100 ml ... energie 199 kJ / 47 kcal ... vetten 0 g ... koolhydraten 11 g ... waarvan suikers 10 g ... vitamine C 26%"
    
    // Output:
    {
      productName: "Versgeperst appel-sinaasappel- en mangosap",
      servingSize: 100,
      servingUnit: "ml",
      nutrients: {
        energyKj: 199,
        energyKcal: 47,
        fat: 0,
        saturatedFat: 0,
        carbohydrates: 11,
        sugars: 10,
        fiber: 0,
        protein: 0.4,
        salt: 0,
        sodium: null,
        vitamins: {
          "vitamine C": { value: 21, unit: "mg", dailyPercentage: 26 }
        }
      }
    }
    ```

### `src/calculator.js` - Nutrition Calculator
- **Function**: `calculateNutrients(productNutrients, grams)`
  - **Parameters**:
    - `productNutrients`: The parsed nutrients object from `parseNutritionText`
    - `grams`: The amount in grams the user wants to consume
  - **Returns**: `Object` with all nutrient values scaled to the specified grams
  - **Example**:
    ```javascript
    // Input:
    const productNutrients = {
      servingSize: 100,
      servingUnit: "g",
      nutrients: {
        energyKcal: 549,
        fat: 33,
        saturatedFat: 13,
        carbohydrates: 55,
        sugars: 45,
        fiber: 2.4,
        protein: 6.8,
        salt: 0.18
      }
    };
    
    // Output for 60g:
    {
      energyKcal: 329.4,
      fat: 19.8,
      saturatedFat: 7.8,
      carbohydrates: 33,
      sugars: 27,
      fiber: 1.44,
      protein: 4.08,
      salt: 0.108
    }
    ```

- **Function**: `calculateDailyTotal(mealItems)`
  - **Parameters**:
    - `mealItems`: Array of `{ productId, grams }` objects
  - **Returns**: `Object` with total nutrients across all items
  - **Example**:
    ```javascript
    // Input:
    const mealItems = [
      { productId: "chocolate", grams: 60 },
      { productId: "juice", grams: 200 }
    ];
    
    // Output:
    {
      energyKcal: 528.6,
      fat: 33.0,
      saturatedFat: 10.2,
      carbohydrates: 55.0,
      sugars: 47.0,
      fiber: 1.44,
      protein: 8.0,
      salt: 0.26
    }
    ```

### `src/storage.js` - localStorage Management
- **Function**: `saveProduct(product)`
  - **Parameters**: `product` - the product object to save
  - **Returns**: `void`
  - Stores the product in localStorage

- **Function**: `getProducts()`
  - **Parameters**: none
  - **Returns**: `Array<Product>` - all saved products

- **Function**: `deleteProduct(productId)`
  - **Parameters**: `productId` - string ID of the product
  - **Returns**: `void`

- **Function**: `saveMealPlan(mealPlan)`
  - **Parameters**: `mealPlan` - the meal plan object
  - **Returns**: `void`

- **Function**: `getMealPlans()`
  - **Parameters**: none
  - **Returns**: `Object` - all meal plans keyed by date

- **Function**: `saveSettings(settings)`
  - **Parameters**: `settings` - user settings (API URL, API key, tracked nutrients)
  - **Returns**: `void`

- **Function**: `getSettings()`
  - **Parameters**: none
  - **Returns**: `Object` - user settings

### `src/export.js` - Data Export/Import
- **Function**: `exportData()`
  - **Parameters**: none
  - **Returns**: `string` - JSON string of all user data

- **Function**: `importData(jsonString)`
  - **Parameters**: `jsonString` - JSON string of exported data
  - **Returns**: `boolean` - true if import succeeded

## UI Structure (public/)

### `public/index.html`
- Main application page with:
  - Header with app name
  - Navigation tabs: Scan, Products, Meal Plan, Settings
  - Camera/image upload section for scanning
  - Product list and management
  - Meal plan builder
  - Nutrition summary display
  - Settings panel for API configuration

### `public/app.js`
- Frontend JavaScript module that:
  - Handles camera capture and image upload
  - Calls `src/ocr.js` and `src/parser.js` for processing
  - Manages UI state and DOM updates
  - Calls `src/storage.js` for data persistence
  - Calls `src/calculator.js` for nutrition calculations
  - Renders meal plans and nutrition summaries

### `public/styles.css`
- Responsive CSS for the application
- Clean, modern design
- Mobile-friendly layout

## User Flows

### Flow 1: Scan a Product
1. User navigates to "Scan" tab
2. User captures photo or uploads image of nutrition label
3. App displays the image for review
4. User clicks "Extract" to send to AI OCR
5. App displays extracted text for review
6. App parses the text and displays structured nutrition data
7. User reviews and edits values if needed
8. User clicks "Save Product" to store the product

### Flow 2: Create a Meal Plan
1. User navigates to "Meal Plan" tab
2. User selects a date (or today is selected by default)
3. User adds a meal (breakfast, lunch, dinner, snack)
4. For each meal, user adds products by selecting from saved products
5. User specifies the amount in grams for each product
6. App calculates and displays the nutrition for each item and the meal total
7. User can add multiple meals for the day
8. App displays daily totals and tracks against user's goals

### Flow 3: Configure Tracking
1. User navigates to "Settings" tab
2. User enters their OpenAI-compatible API URL and key
3. User selects which nutrients to track (calories, sodium, saturated fats, etc.)
4. User can set daily goals for each tracked nutrient
5. User saves settings

## Non-Functional Requirements

- **Free & No Ads**: The app is completely free with no advertisements
- **Multi-language**: UI in English and Spanish; OCR handles German, French, Dutch, Italian, Spanish, English labels
- **Privacy**: All data stored locally in the browser; no server-side storage
- **Performance**: OCR response time depends on the AI service; parsing and calculation are instant
- **Accessibility**: WCAG 2.1 AA compliant where possible