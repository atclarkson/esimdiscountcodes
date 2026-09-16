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

  // i18n: src/_data/locales.json is the single registry of enabled
  // languages. The default locale (English) is unprefixed at the site
  // root, exactly as it is today - adding a locale never moves or
  // reissues an existing URL. A new locale gets a prefixed subtree
  // (e.g. /de/holafly/) driven by its own templates; see I18N.md for
  // the full pattern. These are just the defaults a page falls back to
  // when it doesn't declare its own `locale` (i.e. every page today).
  const locales = require("./src/_data/locales.json");
  const defaultLocaleEntry = locales.find((l) => l.default) || locales[0];
  eleventyConfig.addGlobalData("defaultLocale", defaultLocaleEntry.code);
  eleventyConfig.addGlobalData("locale", defaultLocaleEntry.code);
  eleventyConfig.addGlobalData("ogLocale", defaultLocaleEntry.ogLocale);

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

  // Always render our own/primary code first, regardless of JSON array order.
  // Stable sort: valid primary codes first, then everything else in place.
  eleventyConfig.addFilter("sortedCodes", function (codes) {
    if (!Array.isArray(codes)) return codes;
    const rank = (c) => (c.isPrimary && !c.isInvalid ? 0 : 1);
    return [...codes].sort((a, b) => rank(a) - rank(b));
  });

  // Look up a specific code object by code string, so article copy can
  // reference the live primary code/discount instead of a hardcoded value.
  eleventyConfig.addFilter("findCode", function (codes, code) {
    if (!Array.isArray(codes)) return null;
    return codes.find((c) => c.code === code) || codes[0] || null;
  });

  // Whether a provider's code list includes our own affiliate code
  // (valid, not invalidated). Used to prioritize our own providers in
  // places like nav ordering, instead of raw list position.
  eleventyConfig.addFilter("hasOwnCode", function (codes) {
    if (!Array.isArray(codes)) return false;
    return codes.some((c) => c.code === "ADAMANDLINDS" && !c.isInvalid);
  });

  // Best code actually worth advertising right now: prefers a valid
  // primary code, falls back to any other valid code, so a temporarily
  // broken primary code doesn't hide a provider's other working codes
  // (or get shown as if it still works).
  eleventyConfig.addFilter("bestValidCode", function (codes) {
    if (!Array.isArray(codes)) return null;
    return (
      codes.find((c) => c.isPrimary && !c.isInvalid) ||
      codes.find((c) => !c.isInvalid) ||
      null
    );
  });

  // i18n: any page that wants a translated-language counterpart sets
  // `translationKey` (e.g. "provider:holafly") and `locale` (e.g. "de")
  // in its own eleventyComputed. This collection groups every such page
  // by translationKey into { translationKey, locales: { en: "/x/", de:
  // "/de/x/" } }, which is how meta.njk and the sitemaps find a page's
  // alternate-language URLs without any page needing to know about any
  // other page. A translationKey with only one locale (the current,
  // English-only reality) simply produces no hreflang output yet - nothing
  // to fix when the next locale is added, it activates on its own.
  eleventyConfig.addCollection("i18nMap", (collectionApi) => {
    const map = {};
    for (const item of collectionApi.getAll()) {
      const key = item.data.translationKey;
      const itemLocale = item.data.locale;
      if (!key || !itemLocale) continue;
      if (!map[key]) map[key] = {};
      map[key][itemLocale] = item.url;
    }
    return Object.entries(map).map(([translationKey, localeUrls]) => ({
      translationKey,
      locales: localeUrls,
    }));
  });

  // Look up one page's alternate-language URL map by its translationKey.
  eleventyConfig.addFilter("i18nAlternates", function (i18nMapCollection, translationKey) {
    if (!translationKey || !Array.isArray(i18nMapCollection)) return {};
    const entry = i18nMapCollection.find((e) => e.translationKey === translationKey);
    return entry ? entry.locales : {};
  });

  // Format a { locale: url } alternates map as sitemap hreflang
  // annotations (xhtml:link, per Google's sitemap i18n spec), including
  // an x-default pointing at the site's default-locale version.
  eleventyConfig.addFilter("hreflangs", function (alternates, siteUrl) {
    if (!alternates || Object.keys(alternates).length < 2) return "";
    const localeMeta = require("./src/_data/locales.json");
    const toAbs = (u) => (u.startsWith("http") ? u : siteUrl.replace(/\/$/, "") + u);
    let out = "";
    for (const [code, url] of Object.entries(alternates)) {
      const hreflang = (localeMeta.find((l) => l.code === code) || {}).hreflang || code;
      out += `\n    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${toAbs(url)}"/>`;
    }
    const defaultCode = (localeMeta.find((l) => l.default) || localeMeta[0]).code;
    if (alternates[defaultCode]) {
      out += `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${toAbs(alternates[defaultCode])}"/>`;
    }
    return out;
  });

  // Keep this at the end. Nothing after this.
  return {
    dir: { input: "src", output: "_site" },
  };
};
