const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const os = require("os");

module.exports = async (bot) => {
  bot.command(["pastebin", "pastebindl"], async (ctx) => {
    const text = ctx.message.text.split(" ")[1];
    if (!text) {
      return ctx.reply("❌ Masukkan URL Pastebin!\n\n*Contoh:* `/pastebin https://pastebin.com/z77zNeZb`", {
        parse_mode: "Markdown",
      });
    }

    try {
      await ctx.reply("⏳");

      const res = await fetch(`https://api.botcahx.eu.org/api/download/pastebin?url=${text}&apikey=sokepxyz`);
      const json = await res.json();

      if (!json.status || !json.result) {
        return ctx.reply("❌ Gagal mengambil data dari Pastebin.");
      }

      // Simpan hasil ke file sementara
      const filename = `pastebin-${Date.now()}.txt`;
      const filepath = path.join(os.tmpdir(), filename);
      fs.writeFileSync(filepath, json.result);

      await ctx.replyWithDocument(
        { source: filepath, filename },
        { caption: "📄 Hasil Pastebin dalam file." }
      );

      fs.unlinkSync(filepath); // Hapus setelah kirim
    } catch (e) {
      console.error(e);
      return ctx.reply("⚠️ Terjadi kesalahan saat mengambil data atau mengirim file.");
    }
  });
};