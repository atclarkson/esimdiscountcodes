const markdownIt = require("markdown-it");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const { execSync } = require("node:child_process");
const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
  // Passthrough
  eleventyConfig.addPassthroughCopy("src/style/style.css");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  // RSS plugin
  eleventyConfig.addPlugin(pluginRss);

  // Global data
  eleventyConfig.addGlobalData("buildTime", () => new Date().toISOString());
  eleventyConfig.addGlobalData("site", {
    url: "https://esimdiscountcodes.com",
    name: "eSIM Discount Codes",
  });

  // Existing date filter
  eleventyConfig.addFilter("date", function (date, format) {
    const d = new Date(date);
    if (format === "YYYY-MM-DD") return d.toISOString().split("T")[0];
    return d.toISOString();
  });

  // NEW: pretty and ISO date helpers (used in templates)
  eleventyConfig.addFilter("fmtDate", (d, fmt = "LLLL d, yyyy") =>
    DateTime.fromJSDate(new Date(d), { zone: "utc" }).toFormat(fmt)
  );
  eleventyConfig.addFilter("fmtISO", (d) =>
    DateTime.fromJSDate(new Date(d), { zone: "utc" }).toISO()
  );

  // Git last modified
  eleventyConfig.addFilter("gitLastMod", function (inputPath, fallbackDate) {
    try {
      const out = execSync(`git log -1 --format=%cI "${inputPath}"`, {
        stdio: ["ignore", "pipe", "ignore"],
      })
        .toString()
        .trim();
      return out || fallbackDate;
    } catch {
      return fallbackDate;
    }
  });

  // Markdown
  const md = markdownIt({ html: true, breaks: true, linkify: true });
  eleventyConfig.setLibrary("md", md);

  // includeMarkdown filter
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

  // providerEntries
  eleventyConfig.addGlobalData("providerEntries", () => {
    const codes = require("./src/_data/codes.json");
    return Object.entries(codes);
  });

  // Keep this at the end. Nothing after this.
  return {
    dir: { input: "src", output: "_site" },
  };
};
