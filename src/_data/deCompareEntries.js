// German comparison pages are opt-in per pair, mirroring
// deProviderEntries.js: a pair only gets a /de/compare/<slug>/ page once a
// real, translated content file exists at
// src/_includes/content/de/compare/<slug>.njk. This scans for those files
// instead of listing slugs by hand, so adding a translation is enough on
// its own to make the page appear.
const fs = require("fs");
const path = require("path");
const comparisons = require("./comparisons.json");

module.exports = () => {
  const contentDir = path.join(__dirname, "..", "_includes", "content", "de", "compare");
  if (!fs.existsSync(contentDir)) return [];
  const translated = new Set(
    fs
      .readdirSync(contentDir)
      .filter((f) => f.endsWith(".njk"))
      .map((f) => f.replace(/\.njk$/, ""))
  );
  return comparisons.filter((c) => translated.has(c.slug));
};
