const axios = require("axios");

module.exports = (bot) => {
  bot.command("brat", async (ctx) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const messageTime = ctx.message.date;
    if (currentTime - messageTime > 2) return;

    const text = ctx.message.text.split(" ").slice(1).join(" ");
    if (!text) {
      return ctx.reply("Mana Teksnya 🤬", { parse_mode: "Markdown" });
    }

    try {
      // Primary API attempt
      const url = `https://api.ryhar.my.id/api/maker/brat?text=${encodeURIComponent(text.substring(0, 151))}&apikey=slbdirr2468lt00ja6a53`;
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 15000,
      });

      const buffer = Buffer.from(response.data);
      if (!buffer || buffer.length === 0) {
        return ctx.reply("🪐 Gagal membuat stiker. Respon kosong.");
      }

      // Try sending as photo first, then sticker as fallback
      try {
        await ctx.replyWithPhoto({ source: buffer }, {
          caption: `Text : ${text}`
        });
      } catch (photoError) {
        console.log("📸 Photo failed, trying sticker:", photoError.message);
        await ctx.replyWithSticker({ source: buffer });
      }
    } catch (error) {
      console.error("❌ Error di /brat:", error.message);
      
      // Fallback: Simple text response with brat styling
      const bratText = `🟢 BRAT STYLE 🟢\n\n${text.toLowerCase()}\n\n(API temporarily unavailable)`;
      
      try {
        await ctx.reply(bratText);
      } catch (replyError) {
        console.error("❌ Fallback reply failed:", replyError.message);
        await ctx.reply("🪐 Brat generator sedang error. Coba lagi nanti!");
      }
    }
  });
};