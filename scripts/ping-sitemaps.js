// CommonJS version
const https = require("https");

const siteUrl = process.env.SITE_URL || "https://esimdiscountcodes.com";
const sitemapUrl = `${siteUrl}/sitemap.xml`;
const targets = [
  `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
];

function ping(url) {
  https
    .get(url, (res) => {
      console.log(`Pinged ${url} -> ${res.statusCode}`);
      // drain response so the process can exit cleanly
      res.resume();
    })
    .on("error", (err) => {
      console.error(`Ping error for ${url}:`, err.message);
    });
}

if (process.env.NODE_ENV === "production" || process.env.CI) {
  targets.forEach(ping);
} else {
  console.log("Skipping sitemap pings. Set NODE_ENV=production to enable.");
}
