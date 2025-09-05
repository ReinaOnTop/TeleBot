const axios = require("axios");

module.exports = (bot) => {
  bot.command("bratvideo", async (ctx) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const messageTime = ctx.message.date;
    if (currentTime - messageTime > 2) return;

    const text = ctx.message.text.split(" ").slice(1).join(" ");
    if (!text) {
      return ctx.reply("Mana Teksnya 🤬\n\nContoh: `/bratvideo hello world`", { parse_mode: "Markdown" });
    }

    // Send loading message
    const loadingMsg = await ctx.reply("🎬 Creating brat video... Please wait ⏳");

    try {
      // Primary API attempt
      const url = `https://api.ryhar.my.id/api/maker/brat-video?text=${encodeURIComponent(text.substring(0, 151))}&apikey=slbdirr2468lt00ja6a53`;
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 30000, // Extended timeout for video processing
      });

      const buffer = Buffer.from(response.data);
      if (!buffer || buffer.length === 0) {
        await ctx.telegram.editMessageText(ctx.chat.id, loadingMsg.message_id, null, "🪐 Gagal membuat video. Respon kosong.");
        return;
      }

      // Delete loading message
      await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);

      // Send video
      await ctx.replyWithVideo({ source: buffer }, {
        caption: `Text : ${text}`
      });

    } catch (error) {
      console.error("❌ Error di /bratvideo:", error.message);
      
      // Delete loading message and send error
      await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
      
      // Fallback: Simple text response with brat styling
      const bratText = `🎬 BRAT VIDEO 🎬\n\n${text.toLowerCase()}\n\n(Video API temporarily unavailable)`;
      
      try {
        await ctx.reply(bratText);
      } catch (replyError) {
        console.error("❌ Fallback reply failed:", replyError.message);
        await ctx.reply("🪐 Brat video generator sedang error. Coba lagi nanti!");
      }
    }
  });
};