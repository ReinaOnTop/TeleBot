const os = require("os");

const startedAt = Date.now();

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

module.exports = (bot) => {
  bot.command(["runtime", "uptime", "sysruntime"], async (ctx) => {
    try {
      const uptime = Date.now() - startedAt;

      const memUsed = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(2);
      const memTotal = (os.totalmem() / 1024 / 1024).toFixed(2);

      const text = `
𝗦𝗬𝗦𝗧𝗘𝗠 - 𝗥𝗨𝗡𝗧𝗜𝗠𝗘
🕐 Uptime     : ${formatUptime(uptime)}
🧠 RAM Used   : ${memUsed} MB / ${memTotal} MB
💻 Platform   : ${os.platform()} (${os.arch()})
🔧 CPU Cores  : ${os.cpus().length}
📡 Hostname   : ${os.hostname()}
⏰ Start Time : ${new Date(startedAt).toLocaleString()}
`.trim();

      await ctx.reply(text);
    } catch (err) {
      console.error("Runtime command error:", err);
      ctx.reply("❌ Error fetching system runtime.");
    }
  });
};