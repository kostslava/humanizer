/**
 * Programmatic post-processor: a safety net that catches AI-flagged words/phrases
 * the model missed. Runs on the complete output text after generation.
 *
 * Rules: deterministic replacements only — we don't re-call the model here.
 * Each entry is [regex, replacement]. Replacements rotate via a simple index
 * so the same word doesn't always map to the same substitute (adds variance).
 */

// Words with multiple replacement options — pick one deterministically
// based on position in the text to avoid monotony.
const MULTI_REPLACEMENTS = [
  {
    pattern: /\butilize[sd]?\b/gi,
    options: ["use", "uses", "used"],
    simple: (m) => m.replace(/utilize(s|d)?/i, (_, s) => (s === "s" ? "uses" : s === "d" ? "used" : "use")),
  },
  {
    pattern: /\butilizing\b/gi,
    simple: () => "using",
  },
  {
    pattern: /\bleverage[sd]?\b(?=\s+(the|a|an|our|their|its|this|that|these|those|my|your|his|her)\b)/gi,
    options: ["use", "tap into", "lean on"],
    simple: () => "use",
  },
  {
    pattern: /\bdelve[sd]?\b/gi,
    options: ["dig in", "look at", "dig into"],
    simple: () => "dig into",
  },
  {
    pattern: /\bdelving\b/gi,
    simple: () => "digging into",
  },
  {
    pattern: /\btapestry\b/gi,
    options: ["mix", "web", "picture", "landscape"],
    simple: () => "mix",
  },
  {
    pattern: /\bpivotal\b/gi,
    options: ["key", "defining", "critical", "make-or-break"],
    simple: () => "key",
  },
  {
    pattern: /\bunderscores\b/gi,
    options: ["shows", "drives home", "makes clear"],
    simple: () => "shows",
  },
  {
    pattern: /\bunderscoring\b/gi,
    simple: () => "making clear",
  },
  {
    pattern: /\bfurthermore\b/gi,
    options: ["on top of that", "and yet", "what's more"],
    simple: () => "on top of that",
  },
  {
    pattern: /\bmoreover\b/gi,
    options: ["and yet", "what's more", "on top of that"],
    simple: () => "and yet",
  },
  {
    pattern: /\badditionally\b/gi,
    options: ["beyond that", "and", "what's more"],
    simple: () => "beyond that",
  },
  {
    pattern: /\bshowcases\b/gi,
    options: ["shows", "proves", "puts on display"],
    simple: () => "shows",
  },
  {
    pattern: /\bshowcase[sd]?\b/gi,
    simple: () => "show",
  },
  {
    pattern: /\bmultifaceted\b/gi,
    options: ["layered", "complex", "many-sided"],
    simple: () => "layered",
  },
  {
    pattern: /\brobust\b/gi,
    options: ["strong", "solid", "hard to break"],
    simple: () => "solid",
  },
  {
    pattern: /\bfacilitate[sd]?\b/gi,
    options: ["help", "enable", "make possible"],
    simple: () => "help",
  },
  {
    pattern: /\bfacilitating\b/gi,
    simple: () => "enabling",
  },
  {
    pattern: /\bplethora\b/gi,
    options: ["a lot of", "plenty of", "loads of"],
    simple: () => "plenty of",
  },
  {
    pattern: /\bparamount\b/gi,
    options: ["the most important", "top priority", "critical"],
    simple: () => "the most important",
  },
  {
    pattern: /\bseamlessly\b/gi,
    options: ["smoothly", "without friction", "naturally"],
    simple: () => "smoothly",
  },
  {
    pattern: /\bholistic\b/gi,
    options: ["whole", "full-picture", "end-to-end"],
    simple: () => "whole",
  },
  {
    pattern: /\bsynergies\b/gi,
    simple: () => "combinations",
  },
  {
    pattern: /\bsynergy\b/gi,
    simple: () => "combination",
  },
  {
    pattern: /\bfosters\b/gi,
    options: ["builds", "encourages", "feeds"],
    simple: () => "builds",
  },
  {
    pattern: /\bfoster\b/gi,
    options: ["build", "encourage", "feed"],
    simple: () => "build",
  },
  {
    pattern: /\bfostering\b/gi,
    simple: () => "building",
  },
  {
    pattern: /\bencompasses\b/gi,
    options: ["covers", "includes", "spans"],
    simple: () => "covers",
  },
  {
    pattern: /\bencompass\b/gi,
    simple: () => "cover",
  },
  {
    pattern: /\btransformative\b/gi,
    options: ["game-changing", "genuinely different", "revolutionary"],
    simple: () => "game-changing",
  },
  {
    pattern: /\binnovative\b/gi,
    options: ["new", "fresh", "different", "ahead of the curve"],
    simple: () => "fresh",
  },
  {
    pattern: /\bcomprehensive\b/gi,
    options: ["complete", "thorough", "end-to-end", "full"],
    simple: () => "thorough",
  },
  {
    pattern: /\bin order to\b/gi,
    simple: () => "to",
  },
  {
    pattern: /\bdue to the fact that\b/gi,
    simple: () => "because",
  },
  {
    pattern: /\bat this point in time\b/gi,
    simple: () => "right now",
  },
  {
    pattern: /\bit is important to note that?\b/gi,
    options: ["worth saying", "here's the thing", "notably"],
    simple: () => "worth saying",
  },
  {
    pattern: /\bit is worth noting that?\b/gi,
    options: ["worth noting", "here's something interesting", "notably"],
    simple: () => "worth noting",
  },
  {
    pattern: /\bin conclusion\b/gi,
    options: ["so", "ultimately", "at the end of the day"],
    simple: () => "ultimately",
  },
  {
    pattern: /\bto conclude\b/gi,
    options: ["so", "ultimately", "to wrap up"],
    simple: () => "so",
  },
  {
    pattern: /\bnavigat(?:e|es|ed|ing)\b/gi,
    simple: (m) => {
      if (/navigating/i.test(m)) return "working through";
      if (/navigates/i.test(m)) return "handles";
      if (/navigated/i.test(m)) return "handled";
      return "handle";
    },
  },
  {
    pattern: /\bdemonstrat(?:e|es|ed|ing)\b/gi,
    simple: (m) => {
      if (/demonstrating/i.test(m)) return "showing";
      if (/demonstrates/i.test(m)) return "shows";
      if (/demonstrated/i.test(m)) return "showed";
      return "show";
    },
  },
];

// Contraction fixes — un-contracted speech is a top AI signal
const CONTRACTIONS = [
  [/\bdo not\b/g, "don't"],
  [/\bdoes not\b/g, "doesn't"],
  [/\bdid not\b/g, "didn't"],
  [/\bis not\b/g, "isn't"],
  [/\bare not\b/g, "aren't"],
  [/\bwas not\b/g, "wasn't"],
  [/\bwere not\b/g, "weren't"],
  [/\bcannot\b/g, "can't"],
  [/\bcould not\b/g, "couldn't"],
  [/\bwould not\b/g, "wouldn't"],
  [/\bshould not\b/g, "shouldn't"],
  [/\bwill not\b/g, "won't"],
  [/\bhave not\b/g, "haven't"],
  [/\bhas not\b/g, "hasn't"],
  [/\bhad not\b/g, "hadn't"],
  [/\bI am\b/g, "I'm"],
  [/\bI will\b/g, "I'll"],
  [/\bI have\b/g, "I've"],
  [/\bI would\b/g, "I'd"],
  [/\bwe are\b/g, "we're"],
  [/\bwe have\b/g, "we've"],
  [/\bwe will\b/g, "we'll"],
  [/\bthey are\b/g, "they're"],
  [/\bthey have\b/g, "they've"],
  [/\bthey will\b/g, "they'll"],
  [/\byou are\b/g, "you're"],
  [/\byou have\b/g, "you've"],
  [/\byou will\b/g, "you'll"],
  [/\bhe is\b/g, "he's"],
  [/\bshe is\b/g, "she's"],
  [/\bit is\b/g, "it's"],
  [/\bthat is\b/g, "that's"],
  [/\bthere is\b/g, "there's"],
  [/\bthere are\b/gi, "there are"], // keep — no contraction exists
  [/\bwhat is\b/g, "what's"],
  [/\bwho is\b/g, "who's"],
];

/**
 * Run all post-processing substitutions on the generated text.
 * @param {string} text - the raw LLM output
 * @returns {string} cleaned text
 */
export function postProcess(text) {
  let out = text;

  // 1. Apply word/phrase replacements
  let matchIndex = 0;
  for (const rule of MULTI_REPLACEMENTS) {
    if (rule.simple) {
      out = out.replace(rule.pattern, rule.simple);
    } else if (rule.options) {
      out = out.replace(rule.pattern, () => {
        const replacement = rule.options[matchIndex % rule.options.length];
        matchIndex++;
        return replacement;
      });
    }
  }

  // 2. Enforce contractions — only in lowercase-start contexts to avoid
  //    mangling acronyms like "NASA is not..."
  for (const [pat, rep] of CONTRACTIONS) {
    out = out.replace(pat, rep);
  }

  // 3. Remove double spaces introduced by substitutions
  out = out.replace(/ {2,}/g, " ");

  return out;
}
