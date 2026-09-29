# Nutrition Scanner

A free, ad-free web application that allows users to photograph nutrition labels from food products, extract the nutritional information using OCR with AI, and then create custom meal plans with personalized nutrition tracking.

## Features

- **Photo-based label scanning**: Take a photo or upload an image of a nutrition label
- **Multi-language support**: Parses nutrition labels in German, Dutch, French, Italian, and English
- **AI-powered OCR**: Uses OpenAI-compatible vision models (GPT-4o) to extract text from labels
- **Nutrient tracking**: Scale nutrients to any serving size and track daily totals
- **Meal planning**: Build meals from saved products with custom gram amounts
- **Data export/import**: Backup and restore all your data as JSON

## How to Run

### Prerequisites

- Node.js 24+ (for running tests)
- A modern web browser

### Running the Web App

Simply open `public/index.html` in a web browser. No server required for basic usage.

For a better experience, serve the files with any static file server:

```bash
npx serve public
```

Then open http://localhost:3000

### Running Tests

```bash
npm test
```

## How to Configure the AI Endpoint

1. Open the app in your browser
2. Go to the **Settings** section
3. Enter your API key (e.g., from OpenAI or any OpenAI-compatible provider)
4. Enter the API URL (default: `https://api.openai.com/v1/chat/completions`)
5. Click **Save Settings**

The app uses the OpenAI-compatible chat completions endpoint with the `gpt-4o` model. You can use any compatible provider (OpenAI, Azure, local models with Ollama, etc.).

## How to Test

Run the test suite with Node.js:

```bash
npm test
```

The tests cover:
- OCR API integration (with mocked fetch)
- Nutrition text parsing (German, Dutch, French, Italian, English)
- Nutrient calculation and scaling
- Storage operations (with mock storage)
- Data export/import

## What is Not Done Yet

- **No server-side component**: The app runs entirely in the browser
- **No authentication**: No user accounts or cloud sync
- **Limited OCR**: Relies on external AI API; no offline OCR capability
- **No barcode scanning**: Manual product entry only
- **No nutritional database**: Products must be scanned from labels
- **No recipe management**: Only individual product tracking
- **No mobile app**: Web-only experience

## Project Structure

```
├── src/
│   ├── ocr.js          # OCR module - sends image to AI endpoint
│   ├── parser.js       # Parses OCR text into structured nutrition data
│   ├── calculator.js   # Scales nutrients and calculates daily totals
│   ├── storage.js      # localStorage persistence layer
│   └── export.js       # JSON export/import functionality
├── public/
│   ├── index.html      # Main HTML page
│   ├── app.js          # Frontend application logic
│   └── style.css       # Styling
├── tests/
│   ├── ocr.test.js     # OCR module tests
│   ├── parser.test.js  # Parser module tests
│   ├── calculator.test.js  # Calculator module tests
│   ├── storage.test.js     # Storage module tests
│   └── export.test.js      # Export/import module tests
├── docs/
│   └── SPEC.md         # Product specification
└── package.json
```

## License

MIT