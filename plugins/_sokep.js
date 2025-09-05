const { Markup } = require("telegraf");
const fs = require("fs");
require('../config');

const premiumFile = './lib/saturnAccess.json';
const saturnVideos = [global.thumbnail1, global.thumbnail2, global.thumbnail3, global.thumbnail4];
const randomVideo = () => saturnVideos[Math.floor(Math.random() * saturnVideos.length)];

const mdEscape = s => String(s ?? "").replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");

const isPremiumUser = (userId) => {
  try {
    const saturnAccess = JSON.parse(fs.readFileSync(premiumFile));
    return saturnAccess.includes(userId.toString());
  } catch {
    return false;
  }
};

const runTime = () => {
  const uptime = process.uptime();
  const pad = s => (s < 10 ? "0" + s : s);
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

const sendMenu = async (ctx, edit = false) => {
  const rawName = ctx.from.first_name || "Amigo";
  const userId = ctx.from.id;
  const now = new Date();
  const jam = now.toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" });
  const tanggal = now.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" });
  const status = isPremiumUser(userId) ? "Premium" : "Free User";
  const caption = `
\`\`\`
Name   : ${mdEscape(rawName)}
ID     : ${mdEscape(userId)}
Status : ${mdEscape(status)}
Time   : ${mdEscape(jam)}
Date   : ${mdEscape(tanggal)}
Runtime: ${mdEscape(runTime())}
\`\`\`
`;

  const videoUrl = randomVideo();
  const reply_markup = Markup.inlineKeyboard([
    [{ text: "ALL MENU", callback_data: "open_menu" }]
  ]);

  try {
    if (edit && ctx.editMessageMedia) {
      await ctx.editMessageMedia(
        {
          type: "video",
          media: videoUrl,
          caption,
          parse_mode: "MarkdownV2"
        },
        { reply_markup: reply_markup.reply_markup }
      );
    } else {
      await ctx.replyWithVideo(videoUrl, {
        caption,
        parse_mode: "MarkdownV2",
        reply_markup: reply_markup.reply_markup,
        reply_to_message_id: ctx.message?.message_id
      });
    }
  } catch (err) {
    console.error("sendMenu Error:", err);
  }
};

const createMenuVideo = async (ctx, caption) => {
  await ctx.editMessageMedia(
    {
      type: "video",
      media: randomVideo(),
      caption,
      parse_mode: "MarkdownV2"
    },
    {
      reply_markup: Markup.inlineKeyboard([
        [{ text: "🔙 BACK", callback_data: "open_menu" }]
      ]).reply_markup
    }
  );
};

const sendSettingsMenu = async (ctx) => {
  const caption = `
\`\`\`𝗦𝗘𝗧𝗧𝗜𝗡𝗚𝗦-𝗠𝗘𝗡𝗨
┃ ▢ ᴀᴅᴅᴀᴅᴍɪɴ
┃ ▢ ᴅᴇʟᴀᴅᴍɪɴ
┃ ▢ ᴀᴅᴅᴘᴀɪʀɪɴɢ
┃ ▢ ᴀᴅᴅᴘʀᴇᴍ
┃ ▢ ᴅᴇʟᴘʀᴇᴍ
┃ ▢ ʙʏᴇ ᴏɴ/ᴏꜰꜰ
┃ ▢ ᴡᴇʟᴄᴏᴍᴇ ᴏɴ/ᴏꜰꜰ
┃ ▢ ꜱᴇᴛʙʏᴇ
┃ ▢ ꜱᴇᴛᴡᴇʟᴄᴏᴍᴇ
┃ ▢ ᴄʟᴇᴀʀᴅʙ
┃ ▢ ᴄʟᴇᴀʀꜱᴇꜱꜱɪᴏɴ
┃ ▢ ᴄʟᴇᴀʀᴛᴍᴘ
┃ ▢ ᴏɴʟʏ ɢᴄ
┃ ▢ ᴏɴʟʏ ᴘᴠ
┃ ▢ ᴘᴜʙʟɪᴄ
┃ ▢ ʀᴇꜱᴛᴀʀᴛ
┃ ▢ ꜱᴛᴀᴛᴜꜱ
┃ ▢ ꜱʏɴᴛᴀx
┗━━━━━━━━━━━━━━━━
\`\`\``;
  await createMenuVideo(ctx, caption);
};

const sendFunMenu = async (ctx) => {
  const caption = `
\`\`\`𝗢𝗧𝗛𝗘𝗥-𝗠𝗘𝗡𝗨
┃ ▢ ᴀɪ
┃ ▢ ᴀɪᴇᴅɪᴛ
┃ ▢ ᴀᴘᴘʟᴇᴍᴜsɪᴄ
┃ ▢ ᴀᴜᴛᴏᴀɪ
┃ ▢ ʙʀᴀᴛ
┃ ▢ ʙʀᴀᴛᴠɪᴅᴇᴏ
┃ ▢ ᴄᴇᴋɪᴅᴄʜ
┃ ▢ ɢᴇᴛ
┃ ▢ ʜᴅ
┃ ▢ ʜʏᴛᴀᴍᴋᴀɴ
┃ ▢ ɪᴅᴄʜ
┃ ▢ ɪɴꜰᴏ
┃ ▢ ᴍᴇᴅɪᴀꜰɪʀᴇ
┃ ▢ ᴘᴀꜱᴛᴇʙɪɴ
┃ ▢ ᴘɪɴ
┃ ▢ ᴘɪɴɢ
┃ ▢ ᴘɪɴᴛᴇʀᴇꜱᴛ
┃ ▢ ᴘʟᴀʏ
┃ ▢ ᴘʀᴏꜰɪʟᴇ
┃ ▢ ǫᴄ
┃ ▢ ʀᴇǫ / ʀᴇ request
┃ ▢ ʀᴇᴍɪɴɪ
┃ ▢ ꜱᴛɪᴄᴋᴇʀ
┃ ▢ ᴛɪᴋᴛᴏᴋ
┃ ▢ ᴛᴏᴀᴜᴅɪᴏ
┃ ▢ ᴛᴏᴍᴘ3
┃ ▢ ᴜᴘᴀᴜᴅɪᴏ
┃ ▢ ᴜᴘᴄʜᴀᴛ
┃ ▢ ᴜᴘɪᴍᴀɢᴇ
┃ ▢ ᴜᴘʟᴏᴀᴅ
┃ ▢ ᴜᴘᴛᴇᴋꜱ
┃ ▢ ᴜᴘᴠɪᴅᴇᴏ
┃ ▢ xɴxxᴅʟ
┃ ▢ xɴxxꜱᴇᴀʀᴄʜ
┃━━〔 𝗚𝗔𝗠𝗘 𝗠𝗘𝗡𝗨 〕
┃ ▢ ᴜʟᴀʀᴛᴀɴɢɢᴀ
┗━━━━━━━━━━━━━━━━
\`\`\``;
  await createMenuVideo(ctx, caption);
};

const sendBugMenu = async (ctx) => {
  const caption = `
\`\`\`𝗕𝗨𝗚-𝗠𝗘𝗡𝗨
┃ ▢ sᴏᴋᴇᴘɪɴᴠɪs
┃ ▢ sᴀᴛᴜʀɴɪɴᴠɪs
┃ ▢ sᴀᴛᴜʀɴᴄᴏʀᴇ
┃ ▢ sᴀᴛᴜʀɴsᴛᴜɴᴛ
┃ ▢ sᴘᴀᴍᴄᴀʟʟ
┃ ▢ sᴘᴀᴍᴄᴏᴅᴇ
┗━━━━━━━━━━━━━━━━
\`\`\``;
  await createMenuVideo(ctx, caption);
};

const sendStresserMenu = async (ctx) => {
  const caption = `
\`\`\`𝗦𝗧𝗥𝗘𝗦𝗦𝗘𝗥-𝗠𝗘𝗡𝗨
┃ ▢ 301-ʙʏᴘᴀss
┃ ▢ 403-ʙʏᴘᴀss
┃ ▢ sʟᴏᴡ-ʀᴇǫᴜᴇsᴛ
┃ ▢ sʟᴏᴡ-ᴘᴏsᴛ-ғʟᴏᴏᴅ
┃ ▢ sʟᴏᴡʟᴏʀɪs-ʟɪᴋᴇ
┃ ▢ sᴛᴇᴀʟᴛʜ
┃ ▢ x-ᴍɪx
┃ ▢ ǫᴜᴇʀʏ-ғʟᴏᴏᴅs
┃ ▢ ɢʜᴏsᴛ
┃ ▢ ɢᴇᴛ
┃ ▢ ʀᴀɴᴅᴏᴍ-sᴘᴀᴍ
┃ ▢ ʀᴀɴᴅᴏᴍ-ᴘᴀᴛʜ
┃ ▢ ʀᴇғᴇʀᴇʀ-ғʟᴏᴏᴅ
┃ ▢ ʀᴇᴠᴇʀsᴇ-ᴘᴀᴛʜ
┃ ▢ ʀᴇᴠᴇʀsᴇ-ᴘᴀᴛʜ-ғʟᴏᴏᴅ
┃ ▢ ʀᴏᴜʟᴇᴛᴛᴇ
┃ ▢ ʙᴏᴜɴᴄᴇ-ʙʏᴘᴀss
┃ ▢ ʙᴜʟʟᴇᴛ
┃ ▢ ʜ-ғᴀsᴛ
┃ ▢ ʜᴇʟʟ
┃ ▢ ʜᴇᴀᴅ
┃ ▢ ʜᴇᴀᴅᴇʀ-ʙᴏᴍʙ
┃ ▢ ʜᴇᴀᴅᴇʀ-ғʟᴏᴏᴅ
┃ ▢ ʜᴛᴛᴘ-sᴘᴀᴍ
┃ ▢ ʜᴛᴛᴘ-sᴘᴀᴍ-ᴠ2
┃ ▢ ʜᴛᴛᴘ-sᴘᴀᴍ-ᴠ3
┃ ▢ ʜᴛᴛᴘ-sᴘᴀᴍ-ᴠ4
┃ ▢ ʜᴛᴛᴘ-sᴘᴀᴍ-ᴠ5
┃ ▢ ʟᴏɴɢ-ᴜʀʟ
┃ ▢ ∞
┃ ▢ ғʟᴏᴏᴅ-ʜᴛᴍʟ
┃ ▢ ғʟᴏᴏᴅ-ʜᴛᴍʟ-ʙᴏᴅʏ
┃ ▢ ғᴀᴋᴇ-ᴊsᴏɴ
┃ ▢ ғᴀᴋᴇ-ᴊsᴏɴ-ᴘᴏsᴛ
┃ ▢ ᴀɴᴊᴀʏ
┃ ▢ ᴄʜʀᴏᴍᴇ
┃ ▢ ᴄᴀᴄʜᴇ-ʙʏᴘᴀss
┃ ▢ ᴄᴏᴏᴋɪᴇ-ғʟᴏᴏᴅ
┃ ▢ ᴍɪxᴇᴅ-ʜᴇᴀᴅᴇʀ
┃ ▢ ᴍɪxᴇᴅ-ʜᴇᴀᴅᴇʀ-ᴘᴀᴛʜ
┃ ▢ ᴘʀᴏxʏ
┃ ▢ ᴘᴀʏʟᴏᴀᴅ
┃ ▢ ᴘᴏsᴛ
┃ ▢ ᴛʜʀᴏᴛᴛʟᴇ
┃ ▢ ᴠᴏɪᴅ
┃ ▢ ᴢ-ғᴀsᴛ
┗━━━━━━━━━━━━━━━━
\`\`\``;
  await createMenuVideo(ctx, caption);
};

const sendObfMenu = async (ctx) => {
  const caption = `
\`\`\`𝗢𝗕𝗙-𝗠𝗘𝗡𝗨
┃ ▢ ᴄᴜꜱᴛᴏᴍᴇɴᴄ  
┃ ▢ ᴇɴᴄᴀʀᴀʙ  
┃ ▢ ᴇɴᴄᴄʜɪɴᴀ  
┃ ▢ ᴇɴᴄɪɴᴠɪꜱ  
┃ ▢ ᴇɴᴄᴊᴀᴘᴀɴ  
┃ ▢ ᴇɴᴄꜱᴛʀᴏɴɢ  
┃ ▢ ᴇɴᴄᴜʟᴛʀᴀ
┗━━━━━━━━━━━━━━━━
\`\`\``;
  await createMenuVideo(ctx, caption);
};

module.exports = (bot) => {
  // Command awal
  bot.command(["start", "sokep", "saturn"], skp => sendMenu(skp));

  // Callback handler utama
  bot.on("callback_query", async (ctx) => {
    const data = ctx.callbackQuery.data;

    try {
      if (data === "open_menu") {
        await ctx.editMessageMedia({
          type: "video",
          media: randomVideo(),
          caption: "𝗦𝗜𝗟𝗔𝗛𝗞𝗔𝗡 𝗣𝗜𝗟𝗜𝗛 𝗠𝗘𝗡𝗨 𝗬𝗔𝗡𝗚 𝗔𝗗𝗔",
          parse_mode: "MarkdownV2"
        }, {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "OTHER", callback_data: "fun" },
                { text: "ENCRYPTION", callback_data: "obf" }
              ],
              [
                { text: "BUG", callback_data: "bug" },
                { text: "SETTINGS", callback_data: "set" }
              ],
              [
                { text: "STRESSER", callback_data: "stresser" }
    ],
              [{ text: "🔙 BACK", callback_data: "back" }]
            ]
          }
        });
      } else if (data === "fun") return sendFunMenu(ctx);
      else if (data === "bug") return sendBugMenu(ctx);
      else if (data === "obf") return sendObfMenu(ctx);
      else if (data === "set") return sendSettingsMenu(ctx);
      else if (data === "stresser") return sendStresserMenu(ctx);
      else if (data === "back") return sendMenu(ctx, true);
    } catch (e) {
      console.error("Callback Error:", e);
      await ctx.answerCbQuery("❌ Gagal update media.");
    }
  });
};
