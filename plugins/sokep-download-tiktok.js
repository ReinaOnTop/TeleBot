const axios = require("axios");

module.exports = (bot) => {
  bot.command(["tiktok","tt"], async (ctx) => {
    const text = ctx.message.text.split(" ")[1];
    if (!text) return ctx.reply("Mana link tiktoknya 🫴");

    try {
      const res = await axios.get("https://apiz.zteam.biz.id/api/dl/tiktok-hd", {
        params: {
          url: text
        },
        headers: {
          "X-API-Key": "sokepxyz"
        }
      });

      if (!res.data?.status) {
        return ctx.reply("Gagal mendapatkan video :(");
      }

      const videoUrl = res.data.data.serverHD.url || res.data.data.server1.url;
      const caption = res.data.data.caption || "✅ Download berhasil";

      await ctx.replyWithVideo({ url: videoUrl }, { caption });
    } catch (err) {
      console.error(err);
      ctx.reply("❌ Terjadi kesalahan saat mengambil video.");
    }
  });
};