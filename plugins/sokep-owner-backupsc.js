const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);
global.owner = ["7793412585"]; // Ganti sesuai ID kamu

module.exports = (bot) => {
  bot.command("backupsc", async (ctx) => {
    const userId = ctx.from.id.toString();
    if (!global.owner.includes(userId)) {
      return ctx.reply("❌ Hanya owner yang bisa menggunakan perintah ini.");
    }

    const currentDir = process.cwd();
    const zipFileName = path.join(currentDir, "BackupScript.zip");

    try {
      await ctx.reply("📦 Memulai proses backup...\nTunggu sebentar...");

      // Exclude semua folder dan file besar/tidak penting
      const zipCommand = `zip -r "${zipFileName}" . -x "node_modules/*" ".git/*" ".npm/*" "tmp/*" "*.zip" "*.mp4" "*.mp3" "*.jpg" "*.png" "*.webp" "*.sqlite" "*.log" "package-lock.json"`;

      await execAsync(zipCommand, { maxBuffer: 1024 * 1024 * 1024 });

      const stats = fs.statSync(zipFileName);
      const maxSize = 49 * 1024 * 1024; // 49 MB

      if (stats.size > maxSize) {
        fs.unlinkSync(zipFileName);
        return ctx.reply(`❌ File backup terlalu besar (${(stats.size / 1024 / 1024).toFixed(2)} MB).\nKurangi isi project, atau backup manual.`);
      }

      const fileBuffer = fs.readFileSync(zipFileName);

      await ctx.replyWithDocument(
        { source: fileBuffer, filename: "BackupScript.zip" },
        { caption: "✅ Backup selesai.\nSilakan download file ZIP di atas." }
      );

      setTimeout(() => {
        try {
          fs.unlinkSync(zipFileName);
          ctx.reply("🗑️ File backup telah dihapus otomatis.");
        } catch (e) {
          console.error("❌ Gagal hapus ZIP:", e.message);
        }
      }, 10000);

    } catch (err) {
      console.error("❌ Backup error:", err.message);
      ctx.reply("Gagal melakukan backup:\n\n" + err.message);
    }
  });
};