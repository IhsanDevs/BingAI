const puppeteer = require("puppeteer");
const markdown = require("markdown-it");
const styles = require("ansi-styles");
const terminal = require("markdown-it-terminal");
const { removeCodeDelimiters } = require("./removeCodeDelimiters");
const options = {
  styleOptions: {
    code: styles.green,
  },
  highlight: require("cardinal").highlight,
  indent: "    ",
};

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
  tone = 4,
  format = 3,
  length = 3
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
        name: "Ideas",
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
        name: "Long",
        value: 3,
      },
    ],
  };

  const browser = await puppeteer.launch({
    headless: true,
    devtools: true,
    waitForInitialPage: true,
  });

  await (await browser.pages())[0].close();

  const page = await browser.newPage();

  await page.setUserAgent(config.user_agent);
  await page.goto(config.url, { waitUntil: "networkidle0" });

  let client = await page.target().createCDPSession();
  await client.send("Network.enable");
  await client.send("Page.enable");

  await page
    .waitForSelector("textarea#prompt_text")
    .then((el) => {
      console.log("Prompt input found");
    })
    .catch((err) => {
      console.log("Failed to find prompt input");
      return;
    });

  await page
    .type("textarea#prompt_text", prompt, { delay: 10 })
    .then((el) => {
      console.log("Prompt input filled");
    })
    .catch((err) => {
      console.log("Failed to fill prompt input");
      return;
    });

  let toneXPathPosition = config.tone.findIndex((item) => item.value == tone);
  let toneName = config.tone[toneXPathPosition].name;
  await page
    .waitForXPath(
      `//*[@id="underside-coauthor-module"]/div[2]/div/div[1]/div[3]/div[2]/div[1]/div[${toneXPathPosition}]`
    )
    .then(async (el) => {
      console.log(`Element for set result tone to '${toneName}' found`);

      await el.click().then((el) => {
        console.log(`Set result tone to "${toneName}".`);
      });
    })
    .catch((err) => {
      console.log(`Failed to set result tone to '${toneName}'.`);
      return;
    });

  let formatXPathPosition = config.format.findIndex(
    (item) => item.value == format
  );
  let formatName = config.format[formatXPathPosition].name;
  await page
    .waitForXPath(
      `//*[@id="underside-coauthor-module"]/div[2]/div/div[1]/div[4]/div[2]/div/div[${formatXPathPosition}]`
    )
    .then(async (el) => {
      console.log(`Element for set result format to "${formatName}" found`);

      await el.click().then((el) => {
        console.log(`Set result to format "${formatName}".`);
      });
    })
    .catch((err) => {
      console.log(`Failed to set result format to "${formatName}".`);
      return;
    });

  let lengthXPathPosition = config.length.findIndex(
    (item) => item.value == length
  );
  let lengthName = config.length[lengthXPathPosition].name;
  await page
    .waitForXPath(
      `//*[@id="underside-coauthor-module"]/div[2]/div/div[1]/div[5]/div[2]/div/div[${lengthXPathPosition}]`
    )
    .then(async (el) => {
      console.log(`Element for set result length to "${lengthName}" found`);

      await el.click().then((el) => {
        console.log(`Set result length to "${lengthName}".`);
      });
    })
    .catch((err) => {
      console.log(`Failed to set result length to "${lengthName}".`);
      return;
    });

  await page.click("a#compose_button").then((el) => {
    console.log("Compose button clicked");
  });

  client.on("Network.webSocketCreated", async (params) => {
    console.log("Generating content...");
  });
  client.on("Network.webSocketFrameSent", async (params) => {
    console.log("Please wait...");
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

        console.log(lastMessage);

        fs = require("fs");
        fs.writeFile(`./posts/${filename}`, lastMessage, function (err) {
          if (err) return console.log(err);
        });
        console.log("Saved!");
      } else if (type == 1) {
        if (json.arguments[0].messages != undefined) {
          if (json.arguments[0].messages[0].text != undefined) {
            let lastMessage = json.arguments[0].messages.length - 1;
            lastMessage = json.arguments[0].messages[lastMessage].text;
            lastMessage = removeCodeDelimiters(lastMessage);
            console.clear();
            console.log(lastMessage);
          }
        }
      }
    }
  });
  client.on("Network.webSocketClosed", async (params) => {
    await browser.close();
  });
}

module.exports = {
  generate: generateContent,
};
