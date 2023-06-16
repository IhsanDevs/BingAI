#!node
const generate = require("./generate").generate;
const { argv } = require("process");
const yargs = require("yargs");

yargs.version("1.0.0");

yargs
  .command("generate", "Generate a post")
  .options({
    prompt: {
      alias: "p",
      describe: "Prompt to generate content",
      demandOption: true,
      type: "string",
    },
    output: {
      alias: "o",
      describe: "Output filename",
      demandOption: true,
      type: "string",
    },
    tone: {
      alias: "t",
      describe: "Tone of the content",
      demandOption: false,
      type: "number",
      choices: [1, 2, 3, 4, 5],
      default: 4,
      description:
        "1: Professional, 2: Casual, 3: Enthusiastic, 4: Informational, 5: Funny",
      defaultDescription: "Informational",
      requiresArg: false,
    },
    format: {
      alias: "f",
      describe: "Format of the content",
      demandOption: false,
      type: "number",
      choices: [1, 2, 3, 4],
      defaultDescription: "Blog Post",
      description: "1: Paragraph, 2: Email, 3: Blog Post, 4: Chat",
      default: 4,
      requiresArg: false,
    },
    length: {
      alias: "l",
      describe: "Length of the content",
      demandOption: false,
      type: "number",
      choices: [1, 2, 3],
      default: 3,
      description: "1: Short, 2: Medium, 3: Long",
      defaultDescription: "Medium",
      requiresArg: false,
    },
    headless: {
      alias: "h",
      describe: "Run in headless mode",
      demandOption: false,
      type: "boolean",
      default: false,
      defaultDescription: "true",
      requiresArg: false,
    },
  })
  .default("help").argv;

let prompt = yargs.argv.prompt;

// check if prompt text is path to file with check if file exists
const fs = require("fs");
if (fs.existsSync(prompt)) {
  prompt = fs.readFileSync(prompt, "utf8");
}

const main = async () => {
  await generate(
    prompt,
    yargs.argv.output,
    yargs.argv.tone,
    yargs.argv.format,
    yargs.argv.length,
    yargs.argv.headless
  );
};

main();
