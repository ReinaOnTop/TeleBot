const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../lib/database.json");

function loadDB() {
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));
  const db = JSON.parse(fs.readFileSync(dbPath));
  if (!db.welcomeLeft) db.welcomeLeft = {};
  return db;
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function setupCommands(bot) {
  bot.command("welcome", async (ctx) => {
    const chatId = String(ctx.chat.id);
    if (!["group", "supergroup"].includes(ctx.chat.type))
      return ctx.reply("❌ Perintah ini hanya bisa digunakan di grup.");

    const args = ctx.message.text.split(" ")[1];
    if (!["on", "off"].includes(args)) {
      return ctx.reply("🔧 Gunakan format:\n`/welcome on` atau `/welcome off`", {
        parse_mode: "Markdown",
      });
    }

    const db = loadDB();
    if (!db.welcomeLeft[chatId]) db.welcomeLeft[chatId] = {};
    db.welcomeLeft[chatId].welcome = args === "on";
    saveDB(db);

    ctx.reply(`✅ Welcome Message *${args.toUpperCase()}* diaktifkan.`, {
      parse_mode: "Markdown",
    });
  });

  bot.command("bye", async (ctx) => {
    const chatId = String(ctx.chat.id);
    if (!["group", "supergroup"].includes(ctx.chat.type))
      return ctx.reply("❌ Perintah ini hanya bisa digunakan di grup.");

    const args = ctx.message.text.split(" ")[1];
    if (!["on", "off"].includes(args)) {
      return ctx.reply("🔧 Gunakan format:\n`/bye on` atau `/bye off`", {
        parse_mode: "Markdown",
      });
    }

    const db = loadDB();
    if (!db.welcomeLeft[chatId]) db.welcomeLeft[chatId] = {};
    db.welcomeLeft[chatId].bye = args === "on";
    saveDB(db);

    ctx.reply(`✅ Bye Message *${args.toUpperCase()}* diaktifkan.`, {
      parse_mode: "Markdown",
    });
  });

  bot.command("setwelcome", async (ctx) => {
    const chatId = String(ctx.chat.id);
    if (!["group", "supergroup"].includes(ctx.chat.type))
      return ctx.reply("❌ Perintah ini hanya bisa digunakan di grup.");

    const msg = ctx.message.text.split(" ").slice(1).join(" ");
    if (!msg) {
      return ctx.reply("📩 Masukkan teks sambutan.\nContoh:\n/setwelcome Halo @user di *{group}*!", {
        parse_mode: "Markdown",
      });
    }

    const db = loadDB();
    if (!db.welcomeLeft[chatId]) db.welcomeLeft[chatId] = {};
    db.welcomeLeft[chatId].welcomeMsg = msg;
    saveDB(db);

    ctx.reply("✅ Pesan sambutan disimpan!", {
      parse_mode: "Markdown",
    });
  });

  bot.command("setbye", async (ctx) => {
    const chatId = String(ctx.chat.id);
    if (!["group", "supergroup"].includes(ctx.chat.type))
      return ctx.reply("❌ Perintah ini hanya bisa digunakan di grup.");

    const msg = ctx.message.text.split(" ").slice(1).join(" ");
    if (!msg) {
      return ctx.reply("📩 Masukkan teks perpisahan.\nContoh:\n/setbye Bye @user dari *{group}*!", {
        parse_mode: "Markdown",
      });
    }

    const db = loadDB();
    if (!db.welcomeLeft[chatId]) db.welcomeLeft[chatId] = {};
    db.welcomeLeft[chatId].byeMsg = msg;
    saveDB(db);

    ctx.reply("✅ Pesan perpisahan disimpan!", {
      parse_mode: "Markdown",
    });
  });
}

async function handleGroupEvents(ctx, type) {
  const chatId = String(ctx.chat.id);
  const db = loadDB();
  const group = ctx.chat?.title || "grup ini";
  const newMember = ctx.message?.new_chat_members?.[0];
  const leftMember = ctx.message?.left_chat_member;
  const target = newMember || leftMember;
  if (!target) return;

  const userId = target.id;
  const mention = target.username ? `@${target.username}` : target.first_name || "@user";
  const groupData = db.welcomeLeft?.[chatId];

  // Dapatkan foto profil user
  let photoFileId = null;
  try {
    const photos = await ctx.telegram.getUserProfilePhotos(userId, 0, 1);
    if (photos.total_count > 0) {
      // Ambil file_id ukuran terbesar di photo pertama
      const sizes = photos.photos[0];
      const biggest = sizes.reduce((prev, current) =>
        current.file_size > prev.file_size ? current : prev
      );
      photoFileId = biggest.file_id;
    }
  } catch (e) {
    // kalau error, abaikan
    photoFileId = null;
  }

  if (type === "join" && groupData?.welcome) {
    const template = groupData.welcomeMsg || "👋 Selamat datang @user di grup *{group}*!";
    const text = template.replace(/@user/g, mention).replace(/{group}/g, group);

    if (photoFileId) {
      await ctx.replyWithPhoto(photoFileId, { caption: text, parse_mode: "Markdown" });
    } else {
      await ctx.reply(text, { parse_mode: "Markdown" });
    }
  }

  if (type === "leave" && groupData?.bye) {
    const template = groupData.byeMsg || "👋 Selamat tinggal @user dari grup *{group}*!";
    const text = template.replace(/@user/g, mention).replace(/{group}/g, group);

    if (photoFileId) {
      await ctx.replyWithPhoto(photoFileId, { caption: text, parse_mode: "Markdown" });
    } else {
      await ctx.reply(text, { parse_mode: "Markdown" });
    }
  }
}

// Export agar bisa dipakai di index
module.exports = (bot) => {
  setupCommands(bot);
};

module.exports.handleGroupEvents = handleGroupEvents;