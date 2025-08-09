const markdownIt = require("markdown-it");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const { execSync } = require("node:child_process");

module.exports = function (eleventyConfig) {
  // Copy CSS and assets
  eleventyConfig.addPassthroughCopy("src/style/style.css");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  // RSS plugin gives absoluteUrl and friends
  eleventyConfig.addPlugin(pluginRss);

  // Build timestamp
  eleventyConfig.addGlobalData("buildTime", () => new Date().toISOString());

  // Site data
  eleventyConfig.addGlobalData("site", {
    url: "https://esimdiscountcodes.com",
    name: "eSIM Discount Codes",
  });

  // Legacy date filter you already had
  eleventyConfig.addFilter("date", function (date, format) {
    const d = new Date(date);
    if (format === "YYYY-MM-DD") {
      return d.toISOString().split("T")[0];
    }
    return d.toISOString();
  });

  // Clean ISO yyyy-mm-dd for sitemaps
  eleventyConfig.addFilter("isoDate", function (date) {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  });

  // Git last modified date for a file path. Falls back to the given date.
  eleventyConfig.addFilter("gitLastMod", function (inputPath, fallbackDate) {
    try {
      const cmd = `git log -1 --format=%cI "${inputPath}"`;
      const out = execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] })
        .toString()
        .trim();
      return out || fallbackDate;
    } catch {
      return fallbackDate;
    }
  });

  // Markdown config
  const md = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  });
  eleventyConfig.setLibrary("md", md);

  // Include external markdown files into templates
  eleventyConfig.addFilter("includeMarkdown", function (filePath) {
    const fs = require("fs");
    const path = require("path");
    const fullPath = path.join("src", filePath);
    try {
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf8");
        return md.render(content);
      }
      return "";
    } catch (err) {
      console.error(`Error reading markdown file: ${fullPath}`, err);
      return "";
    }
  });

  // Provider entries for pagination
  eleventyConfig.addGlobalData("providerEntries", () => {
    const codes = require("./src/_data/codes.json");
    return Object.entries(codes);
  });

  return {
    dir: { input: "src", output: "_site" },
  };
};
