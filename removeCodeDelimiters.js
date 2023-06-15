function removeCodeDelimiters(str) {
  try {
    // remove first or last character if it is a three backticks ("```")
    if (str.startsWith("```")) {
      str = str.substring(3);
    }
    if (str.endsWith("```")) {
      str = str.substring(0, str.length - 3);
    }
  } catch (error) {
    str = str;
  }

  // Return the original string if no matches found
  return str;
}
exports.removeCodeDelimiters = removeCodeDelimiters;
