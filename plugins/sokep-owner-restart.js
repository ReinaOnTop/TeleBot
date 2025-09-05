const { allowedDevelopers } = require("../config");

module.exports = (bot) => {
  bot.command("restart", async (ctx) => {
    const userId = String(ctx.from.id);

    if (!allowedDevelopers.includes(userId)) {
      return ctx.reply("🚫 Kamu tidak memiliki izin untuk merestart bot.");
    }

    const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

    await ctx.reply(`♻️ *Bot akan direstart...*\n🕒 ${now}`, {
      parse_mode: "Markdown",
    });

    setTimeout(() => {
      process.exit(0);
    }, 1000);
  });
};