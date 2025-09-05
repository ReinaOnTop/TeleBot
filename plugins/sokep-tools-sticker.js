const axios = require("axios");

module.exports = (bot) => {
  bot.command(["s", "sticker"], async (skp) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const messageTime = skp.message.date;
    if (currentTime - messageTime > 1) return;

    const msg = skp.message.reply_to_message;
    if (!msg || !msg.photo) {
      return skp.reply("Reply ke gambar yang mau dijadiin stiker!");
    }

    try {
      const fileId = msg.photo[msg.photo.length - 1].file_id;
      const fileLink = await skp.telegram.getFileLink(fileId);
      const res = await axios.get(fileLink.href, { responseType: "arraybuffer" });
      const buffer = Buffer.from(res.data, "binary");

      await skp.replyWithSticker(
        { source: buffer },
        {
          packname: global.packname || "Sokep",
          author: global.author || "Saturn Crasher",
        }
      );
    } catch (e) {
      console.error(e);
      skp.reply("🪐 Gagal mengubah gambar jadi stiker.");
    }
  });
};