/**
 * Get the path to the chrome executable for current OS.
 * If the path is not found, catch the error and return null.
 */

const getChromePath = () => {
  let chromePath = null;
  try {
    switch (process.platform) {
      case "win32":
        chromePath =
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
        break;
      case "linux":
        chromePath = "/usr/bin/google-chrome";
        break;
      case "darwin":
        chromePath =
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
        break;
      default:
        throw new Error("Unsupported platform: " + process.platform);
    }

    // check if chromePath is valid and exists
    const fs = require("fs");
    if (fs.existsSync(chromePath)) {
      return chromePath;
    } else {
      throw new Error("Chrome path is invalid");
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getChromePath = getChromePath;
