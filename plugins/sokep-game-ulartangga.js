const fs = require('fs');
const { drawBoard } = require('../lib/ular_tangga');
const { escapeMarkdown } = require('../lib/escapeMarkdown');

const dbFile = './lib/database.json';

function loadDB() {
  if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify({ data: { users: {} }, ulartangga: {} }, null, 2));
  return JSON.parse(fs.readFileSync(dbFile));
}

function saveDB(db) {
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}

function ensureUserInDB(userId) {
  const db = loadDB();
  if (!db.data.users[userId]) {
    db.data.users[userId] = { limit: 10, exp: 0, coin: 0 };
    saveDB(db);
  }
}

const maps = [
  {
    map: "https://telegra.ph/file/46a0c38104f79cdbfe83f.jpg",
    name: "Classic",
    stabil_x: 20,
    stabil_y: 20,
    nazz: {
      2: 38, 7: 14, 8: 31, 15: 26, 21: 42, 28: 84,
      36: 44, 51: 67, 78: 98, 71: 91, 87: 94, 16: 6,
      46: 25, 49: 11, 62: 19, 64: 60, 74: 53,
      89: 68, 92: 88, 95: 75, 99: 80
    }
  }
];

function getMap() {
  return maps[Math.floor(Math.random() * maps.length)];
}

module.exports = (bot) => {
  bot.command('ulartangga', async (ctx) => {
    const db = loadDB();
    const chatId = ctx.chat.id.toString();
    const arg = ctx.message.text.split(" ")[1]?.toLowerCase();
    db.ulartangga[chatId] ??= null;

    const game = db.ulartangga[chatId];
    const userId = ctx.from.id.toString();
    const mention = `[${escapeMarkdown(ctx.from.first_name)}](tg://user?id=${userId})`;

    if (!arg) {
      return ctx.replyWithMarkdownV2(`
🐍 *ULAR TANGGA GAME*

Available commands:
• /ulartangga create
• /ulartangga join
• /ulartangga start
• /ulartangga info
• /ulartangga exit

Ketik *kocok* untuk bermain saat giliranmu.
`);
    }

    if (arg === "create") {
      if (game) return ctx.reply("❌ Game sudah dibuat.");
      const map = getMap();
      db.ulartangga[chatId] = {
        date: Date.now(),
        status: "WAITING",
        host: userId,
        players: { [userId]: { langkah: 1 } },
        turn: 0,
        map: map.map,
        map_name: map.name,
        stabil_x: map.stabil_x,
        stabil_y: map.stabil_y,
        nazz: map.nazz
      };
      saveDB(db);
      return ctx.reply(`✅ Game dibuat oleh ${mention}\nGunakan /ulartangga join untuk gabung`, { parse_mode: "Markdown" });
    }

    if (arg === "join") {
      if (!game) return ctx.reply("❌ Tidak ada game aktif.");
      if (game.players[userId]) return ctx.reply("❌ Kamu sudah join.");
      if (Object.keys(game.players).length >= 4) return ctx.reply("❌ Maksimal 4 pemain.");
      if (game.status === "PLAYING") return ctx.reply("❌ Game sudah dimulai.");

      game.players[userId] = { langkah: 1 };
      saveDB(db);
      return ctx.reply(`✅ ${mention} bergabung ke game.`, { parse_mode: "Markdown" });
    }

    if (arg === "info") {
      if (!game) return ctx.reply("❌ Tidak ada game aktif.");
      const info = Object.keys(game.players).map((id, i) =>
        `• ${i + 1}. [Player](tg://user?id=${id}) posisi: ${game.players[id].langkah}`
      ).join("\n");
      return ctx.replyWithMarkdownV2(`
🎲 *INFO GAME*
Host: [host](tg://user?id=${game.host})
Status: ${game.status}
Map: ${game.map_name}
Players:
${info}
`);
    }

    if (arg === "start") {
      if (!game) return ctx.reply("❌ Tidak ada game aktif.");
      if (game.host !== userId) return ctx.reply("❌ Hanya host yang bisa memulai.");
      if (Object.keys(game.players).length < 2) return ctx.reply("❌ Minimal 2 pemain.");

      game.status = "PLAYING";
      game.turn = 0;
      saveDB(db);

      const urutan = Object.keys(game.players).map((id, i) =>
        `• ${["Merah", "Kuning", "Hijau", "Biru"][i]}: [Player](tg://user?id=${id})`).join("\n");

      return ctx.replyWithMarkdownV2(`
🎮 *GAME DIMULAI*

${urutan}

Giliran [Player](tg://user?id=${Object.keys(game.players)[0]}) ketik *kocok*
`);
    }

    if (arg === "exit") {
      if (!game) return ctx.reply("❌ Tidak ada game aktif.");
      if (!game.players[userId]) return ctx.reply("❌ Kamu belum join.");

      delete game.players[userId];
      if (Object.keys(game.players).length === 0) {
        delete db.ulartangga[chatId];
      } else if (game.host === userId) {
        game.host = Object.keys(game.players)[0];
      }

      saveDB(db);
      return ctx.reply("✅ Kamu keluar dari game.");
    }
  });

  bot.hears(/^kocok$/i, async (ctx) => {
    const db = loadDB();
    const chatId = ctx.chat.id.toString();
    const userId = ctx.from.id.toString();
    const game = db.ulartangga[chatId];
    if (!game || game.status !== 'PLAYING') return;

    const players = Object.keys(game.players);
    if (!players.includes(userId)) return;
    if (players[game.turn % players.length] !== userId) {
      return ctx.reply("⛔ Bukan giliranmu.");
    }

    const warna = ["Merah", "Kuning", "Hijau", "Biru"][players.indexOf(userId)];
    const dadu = Math.floor(Math.random() * 6 + 1);
    let langkah = game.players[userId].langkah + dadu;
    if (langkah > 100) langkah = 100 - (langkah - 100);
    if (game.nazz[langkah]) langkah = game.nazz[langkah];
    game.players[userId].langkah = langkah;

    const langkahSemua = players.map(p => game.players[p].langkah);
    const board = await drawBoard(game.map, ...langkahSemua, game.stabil_x, game.stabil_y);

    const teks = (langkah === 100)
      ? `🏁 ${warna} menang!\n+1000 XP +5 Limit +5 Koin`
      : `${warna} naik ke posisi ${langkah} 🎲 Dadu: ${dadu}\nSelanjutnya: [Player](tg://user?id=${players[(game.turn + 1) % players.length]}) ketik *kocok*`;

    if (langkah === 100) {
      delete db.ulartangga[chatId];
    } else {
      game.turn++;
    }

    saveDB(db);
    await ctx.replyWithPhoto({ source: board }, {
      caption: teks,
      parse_mode: "Markdown",
      reply_to_message_id: ctx.message.message_id
    });
  });
};