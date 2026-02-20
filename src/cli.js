#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { Command } = require("commander");

// Load .env from project root before anything else
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env"), quiet: true });

const { humanize } = require("./gemini");

const program = new Command();

program
  .name("humanizer")
  .description("Rewrite AI-generated text so it reads like natural human prose")
  .version("1.0.0")
  .option("-f, --file <path>", "read input from a file instead of stdin")
  .option("-o, --output <path>", "write result to a file instead of stdout")
  .option(
    "-m, --model <name>",
    "Gemini model to use",
    "gemini-3-flash-preview"
  )
  .option(
    "-t, --temperature <number>",
    "sampling temperature (0.0–2.0)",
    parseFloat,
    1.0
  )
  .action(async (opts) => {
    try {
      const input = await getInput(opts);

      if (!input.trim()) {
        console.error("Error: no input text provided.");
        console.error(
          "Pipe text via stdin, or pass --file <path>."
        );
        process.exit(1);
      }

      // Dynamic import for ESM-only packages (ora, chalk)
      const { default: ora } = await import("ora");
      const { default: chalk } = await import("chalk");

      const spinner = ora({
        text: chalk.cyan("Humanizing…"),
        spinner: "dots",
      }).start();

      const result = await humanize(input, {
        model: opts.model,
        temperature: opts.temperature,
      });

      spinner.stop();

      if (opts.output) {
        fs.writeFileSync(opts.output, result, "utf-8");
        console.log(chalk.green(`✓ Written to ${opts.output}`));
      } else {
        process.stdout.write(result + "\n");
      }
    } catch (err) {
      console.error(`\nError: ${err.message}`);
      process.exit(1);
    }
  });

/**
 * Read input from a file or from stdin (piped data).
 */
async function getInput(opts) {
  if (opts.file) {
    return fs.readFileSync(opts.file, "utf-8");
  }

  // Read from stdin (piped input or heredoc)
  if (!process.stdin.isTTY) {
    return new Promise((resolve, reject) => {
      let data = "";
      process.stdin.setEncoding("utf-8");
      process.stdin.on("data", (chunk) => (data += chunk));
      process.stdin.on("end", () => resolve(data));
      process.stdin.on("error", reject);
    });
  }

  // Interactive mode — prompt user
  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stderr,
  });

  return new Promise((resolve) => {
    console.error("Paste your text below, then press Ctrl-D when done:\n");
    let data = "";
    rl.on("line", (line) => (data += line + "\n"));
    rl.on("close", () => resolve(data));
  });
}

program.parse();
