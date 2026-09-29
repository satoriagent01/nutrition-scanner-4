import { test, describe } from "node:test";
import assert from "node:assert/strict";

// Mock fetch for the OCR API call
const originalFetch = global.fetch;

describe("ocr - extractNutritionFromImage", () => {
  test("AC-1: should call the OCR API with correct parameters", async () => {
    let capturedUrl = null;
    let capturedBody = null;

    global.fetch = async (url, options) => {
      capturedUrl = url;
      capturedBody = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Energie 2292 kJ / 549 kcal" } }],
        }),
      };
    };

    const { extractNutritionFromImage } = await import("../src/ocr.js");
    const imageBase64 = "dGVzdCBpbWFnZQ==";
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const apiKey = "test-key";

    const result = await extractNutritionFromImage(imageBase64, apiUrl, apiKey);

    assert.strictEqual(capturedUrl, apiUrl);
    assert.strictEqual(capturedBody.model, "gpt-4o");
    assert.strictEqual(capturedBody.api_key, apiKey);
    assert.ok(capturedBody.messages.length > 0);
    assert.strictEqual(result, "Energie 2292 kJ / 549 kcal");
  });

  test("AC-1: should throw on API error", async () => {
    global.fetch = async () => {
      return { ok: false, status: 500 };
    };

    const { extractNutritionFromImage } = await import("../src/ocr.js");

    await assert.rejects(
      async () => {
        await extractNutritionFromImage("dGVzdCBpbWFnZQ==", "https://api.openai.com/v1/chat/completions", "test-key");
      },
      { message: /API request failed/ }
    );
  });

  test("AC-1: should handle empty response", async () => {
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({ choices: [{ message: { content: "" } }] }),
      };
    };

    const { extractNutritionFromImage } = await import("../src/ocr.js");

    const result = await extractNutritionFromImage("dGVzdCBpbWFnZQ==", "https://api.openai.com/v1/chat/completions", "test-key");
    assert.strictEqual(result, "");
  });

  test("AC-1: should handle multi-line OCR output", async () => {
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Energie\n549 kcal\nFett\n33 g" } }],
        }),
      };
    };

    const { extractNutritionFromImage } = await import("../src/ocr.js");

    const result = await extractNutritionFromImage("dGVzdCBpbWFnZQ==", "https://api.openai.com/v1/chat/completions", "test-key");
    assert.strictEqual(result, "Energie\n549 kcal\nFett\n33 g");
  });
});

// Restore fetch
global.fetch = originalFetch;