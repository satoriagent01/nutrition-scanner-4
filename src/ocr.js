/**
 * OCR module - sends image to OpenAI-compatible endpoint and returns extracted text.
 *
 * @param {string} imageBase64 - Base64-encoded image data
 * @param {string} apiUrl - The OpenAI-compatible API endpoint URL
 * @param {string} apiKey - The API key for authentication
 * @returns {Promise<string>} - Extracted text from the image
 */
export async function extractNutritionFromImage(imageBase64, apiUrl, apiKey) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all text from this nutrition label exactly as it appears. Do not interpret or translate. Return the raw text.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}