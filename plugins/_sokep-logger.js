const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const moment = require("moment-timezone");
const { allowedDevelopers } = require("../config");

let saturnTrack = {};
const settingPath = path.join(__dirname, "../lib/settings.json");
let modeAkses = "all";
try {
  const raw = fs.readFileSync(settingPath);
  const json = JSON.parse(raw);
  modeAkses = json.mode_akses || "all";
} catch {
  modeAkses = "all";
  fs.writeFileSync(settingPath, JSON.stringify({ mode_akses: "all" }, null, 2));
}

// Load user activity
try {
  const data = fs.readFileSync(require("path").join(__dirname, "lib/saturnTrack.json"));
  saturnTrack = JSON.parse(data);
} catch {
  saturnTrack = {};
}

const recordUserActivity = (userId, userNickname) => {
  const now = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
  saturnTrack[userId] = {
    nickname: userNickname,
    last_seen: now,
  };
  fs.writeFileSync(
    require("path").join(__dirname, "../lib/saturnTrack.json"),
    JSON.stringify(saturnTrack, null, 2)
  );
};

const isDeveloper = (id) => allowedDevelopers.includes(id?.toString());

module.exports = (bot) => {
  bot.use(async (ctx, next) => {
    const msg = ctx.message || ctx.channelPost || ctx.editedMessage;
    if (!msg) return next();

    const text =
      msg.text ||
      (msg.sticker && "🏷️ Sticker") ||
      (msg.photo && "🖼️ Photo") ||
      (msg.video && "🎦 Video") ||
      (msg.audio && "🎵 Audio") ||
      (msg.document && "📄 Document") ||
      (msg.voice && "🎙️ Voice") ||
      "🤷‍♂️ Unknown";

    const userId = msg.from?.id?.toString() || msg.sender_chat?.id?.toString() || "Unknown";
    const userNickname = msg.from?.first_name || msg.from?.username || msg.sender_chat?.title || userId;
    const chatType = ctx.chat?.type === "private" ? "Private Chat" : "Group Chat";
    const now = moment().tz("Asia/Jakarta").format("DD-MM-YYYY HH:mm:ss");
    const boxColor = chalk.hex("#00008B");
    const label = chalk.hex("#00BFFF");

    

console.log(boxColor("╔═══════════════════════════════════════════════════════════════════════════"));
console.log(boxColor("║") + ` ${label("Time      ")}: ${label(now)}`);
console.log(boxColor("║") + ` ${label("User ID   ")}: ${label(userId)}`);
console.log(boxColor("║") + ` ${label("Name      ")}: ${label(userNickname)}`);
console.log(boxColor("║") + ` ${label("Chat Type ")}: ${label(chatType)}`);
console.log(boxColor("║") + ` ${label("Message   ")}: ${label(text)}`);
console.log(boxColor("╚═══════════════════════════════════════════════════════════════════════════"));

    if (userId !== "Unknown") {
      recordUserActivity(userId, userNickname);
    }

    // Command untuk set akses
    if (msg.text && msg.text.startsWith("/only")) {
      const parts = msg.text.trim().split(" ");
      const arg = (parts[1] || "").toLowerCase();
      const valid = ["gc", "pv"];

      if (!isDeveloper(userId)) {
        return ctx.reply("❌ Hanya developer yang bisa mengatur mode akses.");
      }

      if (!valid.includes(arg)) {
        return ctx.reply("Penggunaan salah!\nContoh: `/only gc` | `pv`", { parse_mode: "Markdown" });
      }

      modeAkses = arg;
      fs.writeFileSync(settingPath, JSON.stringify({ mode_akses: modeAkses }, null, 2));
      return ctx.reply(`✅ Mode akses diatur ke *${arg.toUpperCase()}*`, { parse_mode: "Markdown" });
    }

    // Public mode setter
    if (msg.text && msg.text.startsWith("/public")) {
      if (!isDeveloper(userId)) {
        return ctx.reply("❌ Hanya developer yang bisa mengatur mode akses.");
      }
      modeAkses = "public";
      fs.writeFileSync(settingPath, JSON.stringify({ mode_akses: modeAkses }, null, 2));
      return ctx.reply("✅ Mode akses diatur ke *PUBLIC*", { parse_mode: "Markdown" });
    }

    // Filter akses berdasarkan mode
    if (msg.text && msg.text.startsWith("/")) {
  const type = ctx.chat?.type;

  if (modeAkses === "gc" && type === "private") {
    return ctx.reply("Bot ini hanya bisa digunakan di *Group Chat*.", { parse_mode: "Markdown" });
  }

  if (modeAkses === "pv" && type !== "private") {
    return ctx.reply("Bot ini hanya bisa digunakan di *Private Chat*.", { parse_mode: "Markdown" });
      }
    }

    await next();
  });
};