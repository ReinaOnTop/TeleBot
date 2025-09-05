const axios = require("axios");
const { Markup } = require("telegraf");

module.exports = (bot) => {
  bot.command(["tiktoksearch","ttsearch"], async (ctx) => {
    const text = ctx.message.text.split(" ").slice(1).join(" ").trim();
    if (!text) return ctx.reply("Incorrect usage, examples:`/tiktoksearch sokepp_p`", { parse_mode: "Markdown" });

    try {
      const res = await axios.get(`https://api.botcahx.eu.org/api/search/tiktoks?query=${encodeURIComponent(text)}&apikey=sokepxyz`);

      if (!res.data.status || !res.data.result || !Array.isArray(res.data.result.data) || res.data.result.data.length === 0) {
        return ctx.reply("⚠️ Tidak ditemukan hasil TikTok dengan kata kunci itu.");
      }

      const video = res.data.result.data[0];
      const url = video.play;
      const title = video.title || "Video TikTok";

      await ctx.replyWithVideo({ url }, {
        caption: `🎵 *${title}*\n👤 @${video.author?.username || "unknown"}`,
        parse_mode: "Markdown"
      });
    } catch (err) {
      console.error(err);
      await ctx.reply("⚠️ Gagal mengambil data dari TikTok.");
    }
  });
};