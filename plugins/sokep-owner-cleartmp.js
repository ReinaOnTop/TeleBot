const fs = require("fs");
const path = require("path");

// ID owner langsung di sini, pastikan STRING
global.owner = ["7793412585"]; // ganti sama ID Telegram lu

module.exports = (bot) => {
  bot.command("cleartmp", async (ctx) => {
    const userId = ctx.from.id.toString();

    // Cek owner
    if (!global.owner.includes(userId)) {
      return ctx.reply("❌ Hanya owner yang bisa menggunakan perintah ini.");
    }

    // Path folder tmp
    const tmpPath = path.join(__dirname, "..", "tmp");

    // Kalau folder ga ada
    if (!fs.existsSync(tmpPath)) {
      return ctx.reply("📁 Folder tmp tidak ditemukan.");
    }

    // Ambil semua file
    const files = fs.readdirSync(tmpPath);
    if (files.length === 0) {
      return ctx.reply("📂 Tidak ada file yang bisa dihapus.");
    }

    // Hapus file satu per satu
    const deleted = [];
    for (const file of files) {
      const fullPath = path.join(tmpPath, file);
      const stat = fs.statSync(fullPath);
      if (stat.isFile()) {
        fs.unlinkSync(fullPath);
        deleted.push(file);
      }
    }

    // Kirim hasil
    if (deleted.length === 0) {
      return ctx.reply("⚠️ Tidak ada file yang berhasil dihapus.");
    }

    return ctx.reply(
      `🧹 Berhasil menghapus ${deleted.length} file dari folder tmp:\n\n${deleted.join("\n")}`
    );
  });
};