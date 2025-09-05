const fs = require("fs");
const path = require("path");

global.owner = ["7793412585"];

module.exports = (bot) => {
  bot.command(["clearsession", "clearsessions"], async (ctx) => {
    const ownerId = ctx.from.id.toString();
    if (!global.owner.includes(ownerId)) {
      return ctx.reply("❌ Hanya owner yang bisa menggunakan perintah ini.");
    }

    const sessionDir = path.join(process.cwd(), "SaturnSession");
    if (!fs.existsSync(sessionDir)) {
      return ctx.reply("📁 Folder `SaturnSession` tidak ditemukan.");
    }

    const files = fs.readdirSync(sessionDir);
    const toDelete = files.filter(file => file !== "creds.json");

    if (toDelete.length === 0) {
      return ctx.reply("📂 Tidak ada file selain creds.json di folder SaturnSession.");
    }

    const deleted = [];

    toDelete.forEach(file => {
      const fullPath = path.join(sessionDir, file);
      try {
        const stats = fs.statSync(fullPath);
        if (!stats.isDirectory()) {
          fs.unlinkSync(fullPath);
          deleted.push(file);
        }
      } catch (err) {
        console.error(`❌ Gagal hapus: ${file}`, err.message);
      }
    });

    await ctx.reply(`🧹 Berhasil menghapus ${deleted.length} file dari SaturnSession.`);
    if (deleted.length > 0) {
      console.log("📦 Deleted session files:", deleted);
    }
  });
};