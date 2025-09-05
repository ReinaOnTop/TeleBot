const fs = require("fs");
const axios = require("axios");
const dbPath = "./lib/database.json";

// Load database & auto inisialisasi
let db = {};
if (fs.existsSync(dbPath)) {
  try {
    db = JSON.parse(fs.readFileSync(dbPath));
  } catch {
    db = {};
  }
}
if (!db.sessionAI) db.sessionAI = {};

function saveDB() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

module.exports = (bot) => {
  // Command /autoai
  bot.command("autoai", async (ctx) => {
    const args = ctx.message.text.split(" ")[1];
    const id = ctx.from.id.toString();

    if (!args) {
      return ctx.reply("🚩 Gunakan: /autoai enable atau /autoai disable", {
        reply_to_message_id: ctx.message.message_id
      });
    }

    if (args === "enable") {
      if (!db.sessionAI[id]) db.sessionAI[id] = [];
      saveDB();
      return ctx.reply("✅ Auto AI aktif!", { reply_to_message_id: ctx.message.message_id });

    } else if (args === "disable") {
      delete db.sessionAI[id];
      saveDB();
      return ctx.reply("🛑 Auto AI dimatikan.", { reply_to_message_id: ctx.message.message_id });

    } else {
      return ctx.reply("⚠️ Argumen tidak dikenali.", { reply_to_message_id: ctx.message.message_id });
    }
  });

  // Middleware AI
  bot.use(async (ctx, next) => {
    const id = ctx.from?.id?.toString();
    const text = ctx.message?.text;
    const isBot = ctx.from?.is_bot;

    if (!text || isBot) return next();
    if (!db.sessionAI[id]) return next();
    if (["/", ".", "!", "#", "\\"].some(p => text.startsWith(p))) return next();

    if (!db.sessionAI[id]) db.sessionAI[id] = [];

    const history = db.sessionAI[id];
    const messages = [
      { role: "system", content: "Kamu adalah Saturn, asisten pribadi buatan Sokep." },
      { role: "assistant", content: "Saya Saturn, asisten pribadi yang siap membantu kapan pun!" },
      ...history.map((msg, i) => ({ role: i % 2 === 0 ? "user" : "assistant", content: msg })),
      { role: "user", content: text }
    ];

    try {
      const res = await axios.post("https://api.botcahx.eu.org/api/search/openai-custom", {
        message: messages,
        apikey: global.apikey
      });

      const reply = res.data?.result;
      if (reply) {
        await ctx.reply(reply, { reply_to_message_id: ctx.message.message_id });
        db.sessionAI[id].push(text, reply);
        saveDB();
      }
    } catch (err) {
      console.error(err);
      ctx.reply("❌ Gagal merespons AI.");
    }

    return next();
  });
}; 