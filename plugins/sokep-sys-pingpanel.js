const os = require("os");
const osu = require("node-os-utils");
const { performance } = require("perf_hooks");
const { Markup } = require("telegraf");

module.exports = (bot) => {
  bot.command("ping", async (ctx) => {
    const start = performance.now();
    const sent = await ctx.reply("𝗖𝗛𝗘𝗖𝗞𝗜𝗡𝗚 𝗦𝗣𝗘𝗘𝗗...");

    const runtime = () => {
      const seconds = process.uptime();
      const d = Math.floor(seconds / (3600 * 24));
      const h = Math.floor((seconds % (3600 * 24)) / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      return `${d}D ${h}H ${m}M ${s}S`;
    };

    let [memInfo, driveInfo, netInfo] = await Promise.all([
      osu.mem.info().catch(() => ({})),
      osu.drive.info().catch(() => ({})),
      osu.netstat.inOut().catch(() => ({ total: { inputMb: "?", outputMb: "?" } })),
    ]);

    const nodeMem = process.memoryUsage();
    const ramUsed = `${(nodeMem.rss / 1024 / 1024).toFixed(1)} MB`;
    const heapTotal = `${(nodeMem.heapTotal / 1024 / 1024).toFixed(2)} MB`;
    const heapUsed = `${(nodeMem.heapUsed / 1024 / 1024).toFixed(2)} MB`;
    const ext = `${(nodeMem.external / 1024 / 1024).toFixed(2)} MB`;
    const abuf = `${(nodeMem.arrayBuffers / 1024 / 1024).toFixed(2)} MB`;

    const end = performance.now();
    const speed = end - start;

    const now = new Date();
    const localeTime = now.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const text = `
\`\`\`𝗖𝗛𝗘𝗖𝗞𝗜𝗡𝗚-𝗦𝗣𝗘𝗘𝗗

𝗞𝗘𝗖𝗘𝗣𝗔𝗧𝗔𝗡
• Response Time    : ${Math.round(speed)} ms
• Runtime Aktif    : ${runtime()}

𝗠𝗘𝗠𝗢𝗥𝗜 (𝗥𝗔𝗠) 
• RAM Total        : ${memInfo.totalMemMb || "?"} MB
• RAM Terpakai     : ${memInfo.usedMemMb || "?"} MB
• Digunakan Node   : ${ramUsed}
• Free Memory      : ${memInfo.freeMemMb || "?"} MB

𝗗𝗥𝗜𝗩𝗘 𝗦𝗧𝗢𝗥𝗔𝗚𝗘
• Total Drive      : ${driveInfo.totalGb || "?"} GB
• Terpakai         : ${driveInfo.usedGb || "?"} GB
• Persentase Pakai : ${driveInfo.usedPercentage || "?"}%

𝗦𝗬𝗦𝗧𝗘𝗠𝗦
• CPU Model        : ${os.cpus()[0]?.model || "?"}
• Core & Speed     : ${osu.cpu.count()} Core @ ${os.cpus()[0]?.speed || "?"} MHz
• Platform         : ${os.platform()}
• Hostname         : ${os.hostname()}
• Waktu Server     : ${localeTime}

𝗡𝗢𝗗𝗘𝗝𝗦 𝗠𝗘𝗠𝗢𝗥𝗬
• rss              : ${ramUsed}
• heapTotal        : ${heapTotal}
• heapUsed         : ${heapUsed}
• external         : ${ext}
• arrayBuffers     : ${abuf}
\`\`\``;

    await ctx.telegram.editMessageMedia(
  ctx.chat.id,
  sent.message_id,
  null,
  {
    type: "photo",
    media: "https://files.catbox.moe/wymb51.jpg",
    caption: text,
    parse_mode: "Markdown",
        reply_markup: Markup.inlineKeyboard([
          Markup.button.callback("Close", `close_${sent.message_id}`)
        ])
      }
    );
  });

  bot.action(/^close_(\d+)/, async (ctx) => {
    try {
      await ctx.deleteMessage();
      await ctx.answerCbQuery("Dihapus");
    } catch (err) {
      await ctx.answerCbQuery("❌ Gagal menghapus.");
    }
  });
};