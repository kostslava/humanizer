const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SYSTEM_PROMPT } = require("./prompt");

/**
 * Humanize a block of text through the Gemini API.
 *
 * @param {string} text        — the AI-generated input text
 * @param {object} [opts]      — optional overrides
 * @param {string} [opts.model]       — model name (default: gemini-2.0-flash)
 * @param {number} [opts.temperature] — sampling temperature (default: 1.0)
 * @returns {Promise<string>}  — humanized text
 */
async function humanize(text, opts = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing GEMINI_API_KEY. Set it in your environment or in a .env file."
    );
  }

  const modelName = opts.model || "gemini-3-flash-preview";
  const temperature = opts.temperature ?? 1.0;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
  });

  const generationConfig = {
    temperature,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  };

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text }] }],
    generationConfig,
  });

  const response = result.response;
  return response.text();
}

module.exports = { humanize };
