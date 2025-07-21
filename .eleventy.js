module.exports = function (eleventyConfig) {
  // Copy CSS and assets
  eleventyConfig.addPassthroughCopy("src/style/style.css");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  // Add build timestamp
  eleventyConfig.addGlobalData("buildTime", () => {
    return new Date().toISOString();
  });

  // Add site data
  eleventyConfig.addGlobalData("site", {
    url: "https://esimdiscountcodes.com",
    name: "eSIM Discount Codes",
  });

  // Add date filter for sitemap
  eleventyConfig.addFilter("date", function (date, format) {
    const d = new Date(date);
    if (format === "YYYY-MM-DD") {
      return d.toISOString().split("T")[0];
    }
    return d.toISOString();
  });

  // Add markdown processing
  const markdownIt = require("markdown-it");
  const md = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  });

  eleventyConfig.setLibrary("md", md);

  // Add a filter to read and process markdown files
  eleventyConfig.addFilter("includeMarkdown", function (filePath) {
    const fs = require("fs");
    const path = require("path");
    const fullPath = path.join("src", filePath);

    try {
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf8");
        return md.render(content);
      } else {
        return ""; // Return empty string if file doesn't exist
      }
    } catch (error) {
      console.error(`Error reading markdown file: ${fullPath}`, error);
      return "";
    }
  });

  // Create provider entries for pagination
  eleventyConfig.addGlobalData("providerEntries", () => {
    const codes = require("./src/_data/codes.json");
    return Object.entries(codes);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
};
