const axios = require("axios");

module.exports = (bot) => {
  bot.command("qc", async (ctx) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const messageTime = ctx.message.date;
    if (currentTime - messageTime > 1) return;

    const text = ctx.message.text.split(" ").slice(1).join(" ");
    if (!text) return ctx.reply("Mana teksnya 😎", { parse_mode: "Markdown" });

    let avatarUrl = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

    try {
      const photos = await ctx.telegram.getUserProfilePhotos(ctx.from.id, { limit: 1 });
      if (photos.total_count > 0) {
        const fileId = photos.photos[0][0].file_id;
        const fileLink = await ctx.telegram.getFileLink(fileId);
        avatarUrl = fileLink.href;
      }
    } catch (e) {
      console.warn("⚠️ Gagal ambil foto profil, pakai default.");
    }

    const obj = {
      type: "quote",
      format: "png",
      backgroundColor: "#232023",
      width: 512,
      height: 768,
      scale: 2,
      messages: [
        {
          entities: [],
          avatar: true,
          from: {
            id: ctx.from.id,
            name: ctx.from.first_name,
            photo: {
              url: avatarUrl,
            },
          },
          text: text,
          replyMessage: {},
        },
      ],
    };

    try {
      const response = await axios.post("https://bot.lyo.su/quote/generate", obj, {
        headers: { "Content-Type": "application/json" },
      });

      const buffer = Buffer.from(response.data.result.image, "base64");
      await ctx.replyWithSticker({ source: buffer });
    } catch (error) {
      console.error("❌ Error generating sticker:", error.message);
      ctx.reply("🪐 Gagal membuat sticker quote. Silakan coba lagi nanti.");
    }
  });
};