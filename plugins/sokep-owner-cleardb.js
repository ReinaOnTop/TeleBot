const fs = require("fs");
const path = require("path");
const { allowedDevelopers } = require("../config");

module.exports = (bot) => {
  bot.command(["cleardatabase","cleardb","deldb","deletedb"], async (ctx) => {
    const userId = String(ctx.from.id);

    if (!allowedDevelopers.includes(userId)) {
      return ctx.reply("❌ Kamu tidak memiliki izin untuk menggunakan perintah ini.");
    }

    const dbPath = path.join(__dirname, "../lib/database.json");
    if (!fs.existsSync(dbPath)) {
      return ctx.reply("⚠️ File database.json tidak ditemukan.");
    }

    try {
      fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
      ctx.reply("✅ Semua isi database telah dikosongkan.");
    } catch (err) {
      ctx.reply("❌ Gagal menghapus isi database.");
    }
  });
};