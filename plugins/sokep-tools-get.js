const axios = require("axios");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const os = require("os");

module.exports = (bot) => {
  bot.command("get", async (ctx) => {
    const text = ctx.message.text.split(" ").slice(1).join(" ");
    if (!/^https?:\/\//i.test(text)) {
      return ctx.reply("❌ Masukkan link yang valid!\nContoh: `/get https://example.com`", { parse_mode: "Markdown" });
    }

    try {
      await ctx.reply("⏳ Mengambil data dari URL...");
      const res = await axios.get(text, { responseType: "arraybuffer" });
      const contentType = res.headers["content-type"];

      const headersText = Object.entries(res.headers)
        .map(([k, v]) => `*${k}:* ${v}`)
        .join("\n");

      if (contentType.startsWith("image/")) {
        return ctx.replyWithPhoto(
          { source: Buffer.from(res.data) },
          { caption: `${text}\n\n*Headers:*\n${headersText}`, parse_mode: "Markdown" }
        );
      }

      if (contentType.startsWith("video/")) {
        return ctx.replyWithVideo(
          { source: Buffer.from(res.data) },
          { caption: `${text}\n\n*Headers:*\n${headersText}`, parse_mode: "Markdown" }
        );
      }

      if (contentType.startsWith("audio/")) {
        return ctx.replyWithAudio(
          { source: Buffer.from(res.data) },
          { caption: `${text}\n\n*Headers:*\n${headersText}`, parse_mode: "Markdown" }
        );
      }

      // Jika file dokumen
      const ext = mime.extension(contentType) || "bin";
      const filename = `get-file-${Date.now()}.${ext}`;
      const tempPath = path.join(os.tmpdir(), filename);

      fs.writeFileSync(tempPath, res.data);

      await ctx.replyWithDocument(
        { source: tempPath, filename },
        { caption: `${text}\n\n*Headers:*\n${headersText}`, parse_mode: "Markdown" }
      );

      fs.unlinkSync(tempPath); // Hapus setelah kirim
    } catch (e) {
      console.error(e);
      ctx.reply("⚠️ Gagal mengambil atau mengirim file dari URL.");
    }
  });
};