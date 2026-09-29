# Nutrition Scanner

A free, open-source nutrition label scanner and meal planner. Take photos of nutrition labels, extract the data with AI, and track your custom nutrition goals — no ads, no subscriptions.

## Features

- **Photo Capture**: Take or upload photos of nutrition labels from any product
- **AI-Powered OCR**: Extracts nutrition information using OpenAI-compatible vision models (GPT-4 Vision, etc.)
- **Multi-Language Support**: Parses labels in German, Dutch, French, Italian, and English
- **Product Library**: Save scanned products for quick reference
- **Meal Planner**: Build meals by specifying gram amounts of saved products
- **Custom Tracking**: Track any nutrients you care about — calories, sodium, saturated fats, or anything else
- **Data Export/Import**: Backup and restore your data as JSON

## How It Works

1. **Scan**: Take a photo of a nutrition label or upload an image
2. **Extract**: AI extracts the raw text from the label
3. **Parse**: The app identifies nutrients and their values (per 100g, per serving, etc.)
4. **Save**: Save the product to your library
5. **Plan**: Add products to a meal with custom gram amounts
6. **Track**: See the total nutrition for your meal, including any custom metrics

## Setup

### Prerequisites

- Node.js 24+
- A modern web browser
- An OpenAI-compatible API key (e.g., from OpenAI, or any compatible provider)

### Running the App

This is a static web application. You can serve it with any HTTP server:

```bash
# Using Python
python3 -m http.server 8080

# Using Node.js (with http-server)
npx http-server public -p 8080

# Using any other static file server
```

Then open `http://localhost:8080` in your browser.

### Configuring the AI Endpoint

1. Open the app in your browser
2. Go to the **Settings** section
3. Enter your API endpoint URL (default: `https://api.openai.com/v1/chat/completions`)
4. Enter your API key
5. Click **Save Settings**

The app uses the OpenAI-compatible chat completions API with vision support. Any provider that supports this API format should work (OpenAI, Azure OpenAI, local models via Ollama, etc.).

## Testing

```bash
npm test
```

The test suite covers:
- OCR extraction (with mocked API calls)
- Nutrition text parsing for multiple languages
- Nutrient calculation and scaling
- Daily total calculation across meal items
- Storage operations
- Data export/import

## Architecture

### Source Files

| File | Purpose |
|------|---------|
| `src/ocr.js` | Sends images to the AI vision API and returns extracted text |
| `src/parser.js` | Parses raw OCR text into structured nutrition data |
| `src/calculator.js` | Scales nutrients and calculates meal totals |
| `src/storage.js` | localStorage persistence for products, meal plans, and settings |
| `src/export.js` | JSON export/import of all user data |
| `public/index.html` | Main HTML page |
| `public/app.js` | Frontend JavaScript |
| `public/style.css` | App styling |

### Data Storage

All data is stored in the browser's `localStorage`:
- `product:<id>` — individual product entries
- `mealplan:<id>` — meal plan entries
- `settings:default` — API settings and tracked nutrients

## What's Not Done Yet

- **Barcode scanning**: No barcode support yet — only photo-based OCR
- **Cloud sync**: Data is stored locally only; no cloud backup
- **Offline AI**: Requires an internet connection for AI processing
- **Nutrient database**: No built-in food database; you must scan each product
- **Mobile app**: Web app only; no native iOS/Android app
- **Recipe sharing**: No social or sharing features
- **Calorie goals**: No daily calorie or macro targets (yet)
- **Allergy alerts**: No automatic allergy detection from ingredients

## License

Free and open-source. No ads, no tracking, no subscriptions.