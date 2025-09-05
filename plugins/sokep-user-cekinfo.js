const fs = require("fs");
const path = require("path");
const { allowedDevelopers } = require("../config");

module.exports = (bot) => {
  bot.command("info", async (ctx) => {
    try {
      const message = ctx.message;
      const entities = message.entities || [];
      let target = null;

      // 1. Dari reply
      if (message.reply_to_message) {
        target = message.reply_to_message.from;
      }

      // 2. Dari mention di grup
      if (!target && ctx.chat?.type?.includes("group")) {
        const mentionEntity = entities.find(e => e.type === "mention");
        if (mentionEntity) {
          const username = message.text.slice(mentionEntity.offset + 1, mentionEntity.offset + mentionEntity.length);
          try {
            const members = await ctx.getChatAdministrators();
            const matched = members.find(m => m.user.username?.toLowerCase() === username.toLowerCase());
            if (matched) {
              target = matched.user;
            } else {
              return ctx.reply("Pengguna tersebut tidak ditemukan di grup ini.");
            }
          } catch (err) {
            console.error("Gagal ambil admin:", err);
            return ctx.reply("Gagal mencari pengguna yang disebut.");
          }
        }
      }

      // 3. Fallback ke pengirim
      if (!target) {
        target = ctx.from;
      }

      const userId = String(target.id);
      const name = target.first_name || "-";
      const username = target.username ? `@${target.username}` : "-";
      const userLink = `[link](tg://user?id=${userId})`;

      // Load status data
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

      // Escape MarkdownV2 chars
      const escape = (text) =>
        text.toString().replace(/[_*[\]()~`>#+=|{}.!\\-]/g, (ch) => `\\${ch}`);

      // Format mirip Rose
      const infoText = `
*User info:*
*ID:* \`${escape(userId)}\`
*First Name:* ${escape(name)}
*Username:* ${escape(username)}
*User link:* ${userLink}
*Status:* ${escape(status)}
      `.trim();

      await ctx.reply(infoText, {
        parse_mode: "MarkdownV2",
        reply_to_message_id: message.message_id,
      });

    } catch (err) {
      console.error("Gagal menampilkan info:", err);
      ctx.reply("Terjadi kesalahan saat mengambil info.");
    }
  });
};