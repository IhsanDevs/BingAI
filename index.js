const generate = require("./generate").generate;

const prompt = `Increase SEO with Laravel 9 and Vue.JS`;

const filename = `increase-seo-with-laravel-9-and-vue-js.md`;

const main = async () => {
  await generate(prompt, filename);
};

main();
