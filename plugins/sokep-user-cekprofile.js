const fs = require("fs");
const path = require("path");
const { allowedDevelopers } = require("../config");

module.exports = (bot) => {
  bot.command("profile", async (ctx) => {
    try {
      let target = ctx.message.reply_to_message?.from;

      // Cek mention (misalnya /info @username)
      const args = ctx.message.text.split(" ").slice(1);
      if (!target && args.length > 0) {
        const usernameMention = args[0].replace("@", "");
        const found = await ctx.telegram.getChat(`@${usernameMention}`).catch(() => null);
        if (found) target = found;
      }

      // Jika tidak ada target, pakai diri sendiri
      if (!target) {
        target = ctx.from;
      }

      const userId = target.id.toString();
      const name = target.first_name || "-";
      const username = target.username ? `@${target.username}` : "-";
      const userLink = `[${name}](tg://user?id=${userId})`;

      // Load data global jika belum
      if (!global.saturnAccess)
        global.saturnAccess = JSON.parse(fs.readFileSync(path.join(__dirname, "../lib/saturnAccess.json")));
      if (!global.adminList)
        global.adminList = JSON.parse(fs.readFileSync(path.join(__dirname, "../lib/saturnAdmins.json")));
      if (!global.ownerList)
        global.ownerList = allowedDevelopers || [];

      const status = global.ownerList.includes(userId)
        ? "Owner"
        : global.adminList.includes(userId)
        ? "Admin"
        : global.saturnAccess.includes(userId)
        ? "Premium"
        : "Free";

      const infoText = `
*👤 User Info:*
*ID:* \`${userId}\`
*First Name:* ${name}
*Username:* ${username}
*User Link:* ${userLink}
*Status:* ${status.toLowerCase()}
`.trim();

      // Coba ambil foto profil
      const photos = await ctx.telegram.getUserProfilePhotos(target.id, { limit: 1 });
      if (photos.total_count > 0) {
        const fileId = photos.photos[0][0].file_id;
        return await ctx.replyWithPhoto(fileId, {
          caption: infoText,
          parse_mode: "Markdown",
          reply_to_message_id: ctx.message.message_id,
        });
      }

      // Kalau tidak ada foto
      await ctx.replyWithMarkdown(infoText, {
        reply_to_message_id: ctx.message.message_id,
      });

    } catch (err) {
      console.error("❌ Gagal ambil info:", err);
      await ctx.reply("Gagal mengambil informasi user.");
    }
  });
};