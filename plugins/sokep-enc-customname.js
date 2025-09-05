const fs = require("fs-extra");
const path = require("path");
const fetch = require("node-fetch");
const JsConfuser = require("js-confuser");

const log = (...a) => console.log(new Date().toISOString(), ...a);
const bar = p => { const t = 20, f = Math.round(p / 5); return "[" + "█".repeat(f) + " ".repeat(t - f) + `] ${p}%`; };
const upd = (ctx, m, p, l) =>
  ctx.telegram.editMessageText(ctx.chat.id, m.message_id, undefined,
    "```Saturn 🪐\n🔒 EncryptBot\n ⚙️ " + l + " (" + p + "%)\n " + bar(p) + "\n```",
    { parse_mode: "Markdown" }
  );

const getCustomObf = customName => {
  const idGen = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let suf = ""; for (let i = 0; i < Math.floor(Math.random() * 3) + 2; i++) suf += chars[Math.floor(Math.random() * chars.length)];
    return `${customName}_${suf}`;
  };
  return {
    target: "node",
    compact: true,
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: idGen,
    stringEncoding: true,
    stringSplitting: true,
    controlFlowFlattening: 0.75,
    shuffle: true,
    duplicateLiteralsRemoval: true,
    deadCode: true,
    opaquePredicates: true,
    lock: { selfDefending: true, antiDebug: true, integrity: true, tamperProtection: true }
  };
};

module.exports = bot => {
  bot.command("customenc", async ctx => {
    const args = ctx.message.text.split(" ");
    if (args.length < 2 || !args[1]) return ctx.replyWithMarkdown("❌ *Format:* `/customenc <nama>`");
    const customName = args[1].replace(/[^a-zA-Z0-9_]/g, "");
    if (!customName) return ctx.reply("❌ Nama kustom tidak valid!");

    const doc = ctx.message.reply_to_message?.document;
    if (!doc || !doc.file_name.endsWith(".js"))
      return ctx.replyWithMarkdown("❌ *Balas file .js dengan `/customenc <nama>`*");

    const out = path.join(__dirname, `saturn-${customName}-encrypted-${doc.file_name}`);

    try {
      const prog = await ctx.replyWithMarkdown(
        "```Saturn 🪐\n🔒 EncryptBot\n ⚙️ Memulai (" + customName + ") (1%)\n " + bar(1) + "\n```"
      );

      const raw = await (await fetch(await ctx.telegram.getFileLink(doc.file_id))).text();
      await upd(ctx, prog, 20, "Mengunduh Selesai");
      new Function(raw);                           await upd(ctx, prog, 30, "Memvalidasi");

      const obf  = await JsConfuser.obfuscate(raw, getCustomObf(customName));
      const code = typeof obf === "string" ? obf : obf.code;
      await upd(ctx, prog, 60, "Transformasi");
      await fs.writeFile(out, code);               await upd(ctx, prog, 80, "Finalisasi");

      new Function(code);
      await ctx.replyWithDocument(
        { source: out, filename: `saturn-${customName}-encrypted-${doc.file_name}` },
        { caption: `✅ *Custom ${customName} encrypted!*`, parse_mode: "Markdown" }
      );
      await upd(ctx, prog, 100, "Selesai");
    } catch (e) {
      log("Custom enc error:", e.message);
      await ctx.reply(`❌ ${e.message}`);
    } finally {
      if (await fs.pathExists(out)) await fs.remove(out);
    }
  });
};