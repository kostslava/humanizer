# Humanizer

A Node.js CLI tool that rewrites AI-generated text into natural, human-sounding prose using the Google Gemini API. The goal: make the output indistinguishable from skilled human writing — even to detection models like GPTZero, Turnitin, and Copyleaks.

## How it works

The tool sends your text to the Gemini API with a carefully crafted system prompt that instructs the model to:

- **Vary sentence rhythm (burstiness)** — mix short punches with longer, flowing sentences
- **Lower predictability (perplexity)** — swap safe, obvious word choices for more colorful but accurate ones
- **Inject cognitive empathy** — weave in subjective hedges, asides, and anecdotal anchors
- **Kill robotic markers** — strip out "Furthermore," "In conclusion," and other AI tells
- **Use contractions and active voice** — sound like a person, not a term paper generator

## Setup

```bash
# Clone / navigate to the project
cd humanizer

# Install dependencies
npm install

# Add your Gemini API key
cp .env.example .env
# Edit .env and replace "your-api-key-here" with your actual key
```

## Usage

### Pipe text via stdin

```bash
echo "Your AI-generated text here..." | node src/cli.js
```

### Read from a file

```bash
node src/cli.js --file input.txt
```

### Write output to a file

```bash
node src/cli.js --file input.txt --output humanized.txt
```

### Interactive mode

```bash
node src/cli.js
# Paste your text, then press Ctrl-D
```

### Global install (optional)

```bash
npm link
humanizer --file input.txt
```

## Options

| Flag | Description | Default |
|---|---|---|
| `-f, --file <path>` | Read input from a file | stdin |
| `-o, --output <path>` | Write output to a file | stdout |
| `-m, --model <name>` | Gemini model to use | `gemini-3-flash-preview` |
| `-t, --temperature <n>` | Sampling temperature (0.0–2.0) | `1.0` |

## Programmatic use

```js
require("dotenv").config();
const { humanize } = require("./src/gemini");

const result = await humanize("Your AI text here...", {
  model: "gemini-3-flash-preview",
  temperature: 1.0,
});
console.log(result);
```

## License

ISC
