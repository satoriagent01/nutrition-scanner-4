/**
 * OCR extraction from nutrition label images using OpenAI-compatible API.
 * Sends image to OpenAI-compatible OCR endpoint and returns extracted text.
 *
 * @param {string} imageBase64 - Base64 encoded image data
 * @param {string} apiUrl - The OpenAI-compatible API endpoint URL
 * @param {string} apiKey - The API key for authentication
 * @returns {Promise<string>} Extracted text from the image
 */
export async function extractNutritionFromImage(imageBase64, apiUrl, apiKey) {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all text from this nutrition label. Return only the raw text, nothing else. Include all numbers, units, and labels exactly as they appear.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid API response format');
  }

  return data.choices[0].message.content || '';
}