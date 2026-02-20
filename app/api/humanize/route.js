import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { postProcess } from "@/lib/postprocess";

export const runtime = "nodejs";

// Second-pass prompt: tighten whatever the first pass missed
const REFINE_PROMPT = `
You are reviewing text that was already rewritten once to bypass AI detectors.
Your job: read it carefully and fix any remaining AI patterns.

Look specifically for:
1. Any un-contracted speech (do not → don't, cannot → can't, it is → it's, etc.)
2. Any banned words still present: utilize, leverage, delve, tapestry, pivotal, furthermore,
   moreover, additionally, showcases, multifaceted, robust, facilitate, plethora, underscores,
   fosters, encompasses, seamlessly, holistic, synergy, transformative, innovative, comprehensive,
   "in order to", "due to the fact that", "it is important to note"
3. Any 3+ consecutive sentences of similar length — break the rhythm
4. Any paragraph that starts with the AI tell "The [topic]..." multiple times in a row
5. Passive voice constructions that would read more naturally as active

Rewrite with all issues fixed. Preserve all meaning and facts. No preamble. Output only the finished text.
`.trim();

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Default temperature raised to 1.4 — higher randomness = higher perplexity for detectors
  const { text, model = "gemini-2.0-flash", temperature = 1.4, passes = 2 } = body;

  if (!text?.trim()) {
    return Response.json({ error: "No text provided" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY is not configured on the server. Add it to your Vercel environment variables." },
      { status: 500 }
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  async function runPass(inputText, systemPrompt, temp) {
    const geminiModel = genAI.getGenerativeModel({
      model,
      systemInstruction: systemPrompt,
    });

    const generationConfig = {
      temperature: temp,
      topP: 0.98,
      topK: 64,
      maxOutputTokens: 8192,
    };

    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: inputText }] }],
      generationConfig,
    });

    return result.response.text();
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Pass 1 — main humanization
        let output = await runPass(text, SYSTEM_PROMPT, temperature);

        // Pass 2 — refinement pass (lower temp so it doesn't overwrite good work)
        if (passes >= 2) {
          output = await runPass(output, REFINE_PROMPT, Math.max(0.9, temperature - 0.3));
        }

        // Post-processing safety net — deterministic word/phrase substitutions
        output = postProcess(output);

        // Stream the result in chunks so the client sees the text appear
        const CHUNK_SIZE = 80;
        for (let i = 0; i < output.length; i += CHUNK_SIZE) {
          controller.enqueue(encoder.encode(output.slice(i, i + CHUNK_SIZE)));
        }
        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode(`\n\n[Error: ${err.message || "Generation failed"}]`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}
