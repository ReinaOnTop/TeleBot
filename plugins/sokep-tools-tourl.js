const fs = require("fs");
const path = require("path");
const downloadTelegramFile = require("../lib/downloadTelegram");
const { uploadToCatbox } = require("../lib/catbox");

module.exports = (bot) => {
  bot.command("tourl", async (ctx) => {
    const reply = ctx.message?.reply_to_message;
    if (!reply) return ctx.reply("❗ Balas media (foto/video/audio/file/stiker) dengan perintah ini.");

    const file = reply.document?.file_id ||
                 reply.photo?.at(-1)?.file_id ||
                 reply.video?.file_id ||
                 reply.audio?.file_id ||
                 reply.sticker?.file_id;

    if (!file) return ctx.reply("❗ File tidak ditemukan.");

    try {
      const filePath = await downloadTelegramFile(bot.telegram, file, "./tmp");

      // Cek dan tolak .tgs
      if (reply.sticker?.is_animated) {
        fs.unlinkSync(filePath);
        return ctx.reply("⚠️ Stiker animasi .tgs tidak didukung.");
      }

      const url = await uploadToCatbox(filePath);
      await ctx.reply(`✅ Link berhasil dibuat:\n${url}`);
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(err);
      await ctx.reply("⚠️ Gagal membuat URL.");
    }
  });
};