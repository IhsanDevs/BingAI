const puppeteer = require("puppeteer");
const markdown = require("markdown-it");
const styles = require("ansi-styles");
const terminal = require("markdown-it-terminal");
const loading = require("loading-cli");
const figlet = require("figlet");
const chalk = require("chalk");

console.log(
  chalk.yellow(
    figlet.textSync("Bing AI", {
      horizontalLayout: "default",
      verticalLayout: "default",
      font: "Larry 3D",
    }),
    "\n".repeat(2) + " ".repeat(20) + "v1.0.0 - by Ihsan Devs",
    "\n".repeat(2) +
      " ".repeat(2) +
      chalk.green(
        "Bing AI is a tool to generate content from prompt using AI." +
          "\n".repeat(2)
      )
  )
);

const { removeCodeDelimiters } = require("./removeCodeDelimiters");
const { default: getChromePath } = require("./chromePath");
const options = {
  styleOptions: {
    code: styles.green,
  },
  highlight: require("cardinal").highlight,
  indent: "    ",
};

const load = loading("Initializing...").start();
const md = new markdown();
md.use(terminal, options);

/**
 *
 * @param {string} prompt [prompt to generate content]
 * @param {string} filename [filename to save content]
 * @param {number} tone [tone of the content]
 * @param {number} format [format of the content]
 * @param {number} length [length of the content]
 * @returns {string} markdown
 *
 *
 * @requires {string} prompt, {string} filename
 * @default {number} <tone = 4>, {number} <format = 3>, {number} <length = 3>
 * @description Generate content from prompt
 * @returns {string} markdown
 *
 *
 * @example
 * generateContent("Write a blog post about 'How to make a cup of tea'", "how-to-make-a-cup-of-tea.md")
 *
 * @author Ihsan Devs - <contact@ihsandevs.com>
 * @link [Github](https://github.com/IhsanDevs/ContentWriterAI)
 */
async function generateContent(
  prompt,
  filename,
  tone = 5,
  format = 3,
  length = 3,
  headless
) {
  const config = {
    url: "https://edgeservices.bing.com/edgesvc/compose?udsframed=1&form=SHORUN&clientscopes=chat,noheader,coauthor,&darkschemeovr=1",
    user_agent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59",
    tone: [
      {
        name: "Professional",
        value: 1,
      },
      {
        name: "Casual",
        value: 2,
      },
      {
        name: "Enthusiastic",
        value: 3,
      },
      {
        name: "Informational",
        value: 4,
      },
      {
        name: "Funny",
        value: 5,
      },
    ],
    format: [
      {
        name: "Paragraph",
        value: 1,
      },
      {
        name: "Email",
        value: 2,
      },
      {
        name: "Blog Post",
        value: 3,
      },
      {
        name: "Chat",
        value: 4,
      },
    ],
    length: [
      {
        name: "Short",
        value: 1,
      },
      {
        name: "Medium",
        value: 2,
      },
      {
        name: "Unlimited",
        value: 3,
      },
    ],
    headless: headless,
  };

  filename = filename.replace(/ /g, "-").toLowerCase();
  // if filename not end with .md, add .md
  if (!filename.endsWith(".md")) filename += ".md";

  // detect OS platform
  const platform = process.platform;
  // check if chromium executable exists in folder "chromium"

  const browser = await puppeteer
    .launch({
      executablePath: getChromePath,
      headless: config.headless,
      devtools: true,
      waitForInitialPage: true,
    })
    .then((el) => {
      console.clear();
      load.succeed("Browser launched");
      load.info("Creating new instance...");
      return el;
    });

  let availableTextAreaPrompt = false;

  await (await browser.pages())[0].close();

  const page = await browser.newPage();

  await page
    .setUserAgent(config.user_agent)
    .then((el) => {
      load.info("Setting user agent...");

      return el;
    })
    .catch((err) => {
      load.warn("Failed to set user agent");
    });

  await page.goto(config.url).then((el) => {
    load.info("Opening page...");
  });

  await page
    .waitForSelector("textarea#prompt_text")
    .then((el) => {
      load.succeed("Prompt input found");
      availableTextAreaPrompt = true;
    })
    .catch((err) => {
      load.warn("Failed to find prompt input");
      availableTextAreaPrompt = false;
      // restart loop
      return;
    });

  let client = await page.target().createCDPSession();
  await client.send("Network.enable");
  await client.send("Page.enable");

  // search for prompt input
  while (!availableTextAreaPrompt) {
    await page.setUserAgent(config.user_agent).then((el) => {
      load.info("Setting user agent...");
    });

    await page.reload().then((el) => {
      load.info("Reloading page...");
    });
  }

  load.succeed("Prompt input found");

  load.info("Removing maxlength attribute...");

  // promise to wait for maxlength attribute removed
  let promise = new Promise((resolve, reject) => {
    let interval = setInterval(() => {
      page
        .evaluate(() => {
          document.getElementById("prompt_text").removeAttribute("maxlength");
          return document
            .getElementById("prompt_text")
            .getAttribute("maxlength");
        })
        .then((el) => {
          if (el == null) {
            clearInterval(interval);
            resolve();
          }
        });
    }, 100);
  });

  await promise.then(() => {
    load.succeed("Maxlength attribute removed");
  });

  load.info("filling prompt input...");

  await page
    .type("textarea#prompt_text", prompt, { delay: 10 })
    .catch((err) => {
      load.warn("Failed to fill prompt input");
      return;
    });

  // promise to wait for prompt input filled
  promise = new Promise((resolve, reject) => {
    let interval = setInterval(() => {
      page
        .evaluate(() => {
          return document.querySelector("textarea#prompt_text").value;
        })
        .then((el) => {
          if (el == prompt) {
            clearInterval(interval);
            resolve();
          }
        });
    }, 100);
  });

  await promise.then(() => {
    load.succeed("Prompt input filled");
  });

  load.info("Setting tone, format, and length...");

  // search for element div with class "tone-option tag". Remove class "selected" from all element div. Just add class "active" to element with toneXPathQuery[tonePosition]
  var toneName = config.tone[tone - 1].name;
  var tonePosition = config.tone.findIndex((item) => item.value == tone);
  load.info(`Setting result tone to "${toneName}"...`);
  await page.evaluate(
    (toneXPathQuery, tonePosition) => {
      document.querySelectorAll("div.tone-option.tag").forEach((el) => {
        el.classList.remove("selected");
      });
      document
        .querySelector(`div.tone-option.tag:nth-child(${toneXPathQuery})`)
        .classList.add("selected");
    },
    tonePosition + 1,
    tonePosition
  );

  load.succeed(`Result tone set to "${toneName}"`);

  var formatName = config.format[format - 1].name;
  var formatXPathPosition = config.format.findIndex(
    (item) => item.value == format
  );
  var formatName = config.format[formatXPathPosition].name;
  load.info(`Setting result format to '${formatName}...'`);
  await page
    .waitForXPath(
      `//*[@id="underside-coauthor-module"]/div[2]/div/div[1]/div[4]/div[2]/div/div[${formatXPathPosition}]`
    )
    .then(async (el) => {
      load.succeed(`Element for set result format to "${formatName}" found`);
    })
    .catch((err) => {
      load.warn(`Failed to set result format to "${formatName}".`);
    });

  // search for element div with class "paragraph-option". Remove class "selected" from all element div. Just add class "active" to element with paragraphXPathQuery[paragraphPosition]
  var formatName = config.format[format - 1].name;
  var formatXPathPosition = config.format.findIndex(
    (item) => item.value == format
  );
  await page.evaluate(
    (formatXPathQuery, formatXPathPosition) => {
      document.querySelectorAll("div.format-option").forEach((el) => {
        el.classList.remove("selected");
      });
      document
        .querySelector(`div.format-option:nth-child(${formatXPathQuery})`)
        .classList.add("selected");

      // if config format is chat, set chat format
      if (formatXPathPosition == 3) {
        // change attribute unloc-name and aria-label to "Chat"
        document
          .querySelector(`div.format-option:nth-child(${formatXPathQuery})`)
          .setAttribute("unloc-name", "Chat");
        document
          .querySelector(`div.format-option:nth-child(${formatXPathQuery})`)
          .setAttribute("aria-label", "Chat");
        // change p element text to "Chat"
        document.querySelector(
          `div.format-option:nth-child(${formatXPathQuery}) > p`
        ).innerText = "Chat";
      }
    },
    formatXPathPosition + 1,
    formatXPathPosition
  );
  load.succeed(`Result format set to "${formatName}"`);

  // search for element div with class "length-option tag". Remove class "selected" from all element div. Just add class "active" to element with lengthXPathQuery[lengthPosition]
  var lengthName = config.length[length - 1].name;
  var lengthXPathPosition = config.length.findIndex(
    (item) => item.value == length
  );
  load.info(`Setting result length to "${lengthName}"...`);
  await page.evaluate(
    (lengthXPathQuery, lengthXPathPosition) => {
      document.querySelectorAll("div.length-option.tag").forEach((el) => {
        el.classList.remove("selected");
      });
      document
        .querySelector(`div.length-option.tag:nth-child(${lengthXPathQuery})`)
        .setAttribute("unloc-name", "Unlimited");
      document
        .querySelector(`div.length-option.tag:nth-child(${lengthXPathQuery})`)
        .setAttribute("aria-label", "Unlimited");
      document.querySelector(
        `div.length-option.tag:nth-child(${lengthXPathQuery})`
      ).innerText = "Unlimited";

      document
        .querySelector(`div.length-option.tag:nth-child(${lengthXPathQuery})`)
        .classList.add("selected");

      // change text value attribute "aria-label" and "unloc-name" if config.length[lengthXPathPosition].value == 3 to "Unlimited"
      // if (lengthXPathPosition == 3) {
      //   document
      //     .querySelector(`div.length-option.tag:nth-child(${lengthXPathQuery})`)
      //     .setAttribute("unloc-name", "Unlimited");
      //   document
      //     .querySelector(`div.length-option.tag:nth-child(${lengthXPathQuery})`)
      //     .setAttribute("aria-label", "Unlimited");
      //   document.querySelector(
      //     `div.length-option.tag:nth-child(${lengthXPathQuery})`
      //   ).innerText = "Unlimited";
      // }
    },
    lengthXPathPosition + 1,
    lengthXPathPosition
  );
  load.succeed(`Result length set to "${lengthName}"`);

  await page
    .click("a#compose_button")
    .then((el) => {
      load.info("Generating content...");
    })
    .then((el) => {
      load.succeed(`"Content generated successfully."`);
    })
    .catch((err) => {
      load.warn("Failed to generate content.");
    });

  client.on("Network.webSocketCreated", async (params) => {
    load.info("Generating content...");
  });

  client.on("Network.webSocketFrameSent", async (params) => {
    if (params.response.payloadData.includes("conversationId")) {
      const prompt = await params.response.payloadData.replace("\u001e", "");
      const json = JSON.parse(prompt);
      const conversationId = json.arguments[0].conversationId;
      load.succeed(`New conversation ID: ${conversationId}`);
    }
  });

  client.on("Network.webSocketFrameReceived", async (params) => {
    if (params.response.payloadData.includes("type")) {
      let data = await params.response.payloadData.replace(
        `{"type":3,"invocationId":"0"}`,
        ""
      );
      data = data.replace(/\u001e/g, "");
      data = data.replace(//g, "");
      data = data.trim();
      data = data.split("}{")[0];
      let json = {};

      try {
        json = JSON.parse(data);
      } catch (error) {
        json = {
          type: 0,
        };
      }

      let type = json.type;
      if (type == 2) {
        console.clear();

        let position = json.item.messages.findIndex(
          (item) => item.author == "bot" && item.messageType == undefined
        );

        let lastMessage = json.item.messages[position].text;
        lastMessage = removeCodeDelimiters(lastMessage);

        if (lastMessage != undefined) {
          try {
            console.log(md.render(lastMessage));
          } catch (error) {
            console.log(lastMessage);
          }
        }

        fs = require("fs");
        try {
          fs.writeFile(`${filename}`, lastMessage, function (err) {
            if (err) return console.log(err);
          });
          load.succeed(
            `Content generated successfully. Your content is saved in: ${filename}`
          );
        } catch (error) {
          load.text = `Failed to save content in: ${filename} with content:\n\n${lastMessage}. Error:\n\n${error}`;
          load.fail("Failed to save content.");
        }
        await browser.close();
        load.stop();
      } else if (type == 1) {
        if (json.arguments[0].messages != undefined) {
          if (json.arguments[0].messages[0].text != undefined) {
            let lastMessage = json.arguments[0].messages.length - 1;
            lastMessage = json.arguments[0].messages[lastMessage].text;
            lastMessage = removeCodeDelimiters(lastMessage);
            console.clear();
            if (lastMessage != undefined) {
              try {
                console.log(md.render(lastMessage));
              } catch (error) {
                console.log(lastMessage);
              }
            }
          }
        }
      }
    }
  });
  client.on("Network.webSocketClosed", async (params) => {
    load.stop();
    await browser.close();
  });
}

module.exports = {
  generate: generateContent,
};
