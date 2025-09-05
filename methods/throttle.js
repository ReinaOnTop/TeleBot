
const http = require("http");

module.exports = function (target, duration) {
  const { hostname, pathname } = new URL(target);
  const end = Date.now() + duration * 1000;

  function loop() {
    if (Date.now() >= end) return;
    const req = http.request({
      hostname,
      path: pathname || "/",
      method: "GET",
      headers: {
        "User-Agent": "ThrottleBot/1.0"
      }
    }, res => {
      console.log(`[${res.statusCode}] from ${hostname} using GET`);
      res.on("data", () => {});
    });
    req.on("error", () => {});
    req.end();
    setTimeout(loop, 1000); // Wait 1s between each
  }

  loop();
};
