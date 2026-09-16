// German provider pages are opt-in per provider: a provider only gets a
// /de/<key>/ page once a real, translated article exists at
// src/_includes/content/de/<key>.njk. This scans for those files instead
// of listing keys by hand, so adding a translation (today, or via the
// nightly routine later) is enough on its own - no template edit needed
// anywhere to make the new page appear.
const fs = require("fs");
const path = require("path");
const codes = require("./codes.json");

module.exports = () => {
  const contentDir = path.join(__dirname, "..", "_includes", "content", "de");
  if (!fs.existsSync(contentDir)) return [];
  const translated = new Set(
    fs
      .readdirSync(contentDir)
      .filter((f) => f.endsWith(".njk"))
      .map((f) => f.replace(/\.njk$/, ""))
  );
  return Object.entries(codes).filter(([key]) => translated.has(key));
};
