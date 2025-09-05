const fs = require("fs");
const path = require("path");
const { allowedDevelopers } = require("../config");

module.exports = (bot) => {
  bot.command(["getplugin", "gp"], async (ctx) => {
    const userId = String(ctx.from.id);
    if (!allowedDevelopers.includes(userId)) {
      return ctx.reply("🚫 Kamu tidak memiliki izin untuk mengakses plugin.");
    }

    const args = ctx.message.text.trim().split(/\s+/);
    const pluginName = args[1];

    if (!pluginName) {
      return ctx.reply("❗ Masukkan nama plugin.\nContoh: /getplugin menu");
    }

    const cleanName = pluginName.replace(/[^a-z0-9_\-]/gi, '');
    const filePath = path.join(__dirname, "..", "plugins", `${cleanName}.js`);

    if (!fs.existsSync(filePath)) {
      return ctx.reply("❌ Plugin tidak ditemukan.");
    }

    try {
      await ctx.replyWithDocument({ source: filePath, filename: `${cleanName}.js` });
    } catch (err) {
      console.error("❌ Gagal mengirim plugin:", err);
      ctx.reply("🚫 Gagal mengirim file plugin.");
    }
  });
};