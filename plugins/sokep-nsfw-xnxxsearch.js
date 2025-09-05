const fetch = require("node-fetch");

module.exports = (bot) => {
  // Command: /xnxxsearch
  bot.command("xnxxsearch", async (ctx) => {
    const q = ctx.message.text.split(" ").slice(1).join(" ");
    if (!q) {
      return ctx.reply("Masukkan kata kunci!\nContoh: `/xnxxsearch japanese big`", {
        parse_mode: "Markdown",
      });
    }

    try {
      await ctx.replyWithChatAction("upload_photo");

      const res = await fetch(`https://api.botcahx.eu.org/api/search/xnxx?query=${encodeURIComponent(q)}&apikey=sokepxyz`);
      const data = await res.json();

      if (!data.result || data.result.length === 0) {
        return ctx.reply("Tidak ada hasil ditemukan.");
      }

      const results = data.result.slice(0, 15);
      let teks = `*🔍 XNXX Search Results*\n_Kata kunci:_ *${q}*\n\n`;

      results.forEach((vid, i) => {
        teks += `*${i + 1}.* [${vid.title}](${vid.link}) — \`${vid.duration}\`\n`;
      });

      await ctx.replyWithPhoto({ url: data.result[0].thumb }, {
        caption: teks,
        parse_mode: "Markdown"
      });
    } catch (e) {
      return ctx.reply("⚠️ Gagal mengambil data atau format tidak valid.");
    }
  });

  // Command: /xnxx, /xnxxdl, /xnxxdownload
  const downloadCmd = ["xnxx", "xnxxdl", "xnxxdownload"];
  bot.command(downloadCmd, async (ctx) => {
    const q = ctx.message.text.split(" ").slice(1).join(" ");
    if (!q) {
      return ctx.reply("Masukkan link video XNXX!\nContoh: `/xnxx https://www.xnxx.com/video-xxx`", {
        parse_mode: "Markdown",
      });
    }

    try {
      await ctx.replyWithChatAction("upload_video");

      const res = await fetch(`https://api.botcahx.eu.org/api/download/xnxxdl?url=${encodeURIComponent(q)}&apikey=sokepxyz`);
      const data = await res.json();

      if (!data.result || !data.result.url) {
        return ctx.reply("Gagal mengambil video. Link tidak valid atau video tidak tersedia.");
      }

      await ctx.replyWithVideo({ url: data.result.url }, {
        caption: `🎥 *Video XNXX Berhasil Didownload!*\n📎 [Link Asli](${q})`,
        parse_mode: "Markdown",
      });
    } catch (e) {
      return ctx.reply("⚠️ *Gagal mengunduh video atau server error.*");
    }
  });
};