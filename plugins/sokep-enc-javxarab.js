const fs    = require("fs-extra");
const path  = require("path");
const fetch = require("node-fetch");
const JsConfuser = require("js-confuser");

/* ── PRESET JAPAN × ARAB ── */
const mix = ["あ","い","う","え","お","か","き","く","け","こ","さ","し","す","せ","そ","た","ち","つ","て","と","な","に","ぬ","ね","の","は","ひ","ふ","へ","ほ","ま","み","む","め","も","や","ゆ","よ","ら","り","る","れ","ろ","わ","を","ん","أ","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي"];
const genMix = () => Array.from({length:Math.floor(Math.random()*4)+3},()=>mix[Math.floor(Math.random()*mix.length)]).join("");
const getJpxArabObf = () => ({
  target:"node",
  compact:true,
  renameVariables:true,
  renameGlobals:true,
  identifierGenerator:genMix,
  stringCompression:true,
  stringConcealing:true,
  stringEncoding:true,
  stringSplitting:true,
  controlFlowFlattening:0.95,
  flatten:true,
  shuffle:true,
  dispatcher:true,
  duplicateLiteralsRemoval:true,
  deadCode:true,
  calculator:true,
  opaquePredicates:true,
  lock:{ selfDefending:true, antiDebug:true, integrity:true, tamperProtection:true }
});

/* ── UTIL ── */
const log = (...a)=>console.log(new Date().toISOString(),...a);
const bar = p => { const t=20,f=Math.round(p/5); return "["+"█".repeat(f)+" ".repeat(t-f)+`] ${p}%`; };
const upd = (ctx,m,p,l)=>ctx.telegram.editMessageText(
  ctx.chat.id,m.message_id,undefined,
  "```Saturn 🪐\n🔒 EncryptBot\n ⚙️ "+l+" ("+p+"%)\n "+bar(p)+"\n```",
  {parse_mode:"Markdown"}
);

/* ── PLUGIN ── */
module.exports = bot => {
  bot.command("encjapxab", async ctx => {
    const doc = ctx.message.reply_to_message?.document;
    if (!doc || !doc.file_name.endsWith(".js"))
      return ctx.replyWithMarkdown("❌ *Balas file .js dengan `/encjapxab`*");

    const out = path.join(__dirname, `saturn-encrypted-${doc.file_name}`);

    try {
      const prog = await ctx.replyWithMarkdown(
        "```Saturn 🪐\n🔒 EncryptBot\n ⚙️ Memulai (Hardened Japan × Arab) (1%)\n "+bar(1)+"\n```"
      );

      const raw = await (await fetch(await ctx.telegram.getFileLink(doc.file_id))).text();
      await upd(ctx,prog,20,"Mengunduh Selesai");
      new Function(raw);                                await upd(ctx,prog,30,"Memvalidasi");

      const obf  = await JsConfuser.obfuscate(raw, getJpxArabObf());
      const code = typeof obf==="string" ? obf : obf.code;
      await upd(ctx,prog,60,"Transformasi");
      await fs.writeFile(out, code);                    await upd(ctx,prog,80,"Finalisasi");

      new Function(code);
      await ctx.replyWithDocument(
        { source: out, filename: `saturn-encrypted-${doc.file_name}` },
        { caption: "✅ *Japan × Arab encrypted!*", parse_mode:"Markdown" }
      );
      await upd(ctx,prog,100,"Selesai");
    } catch (e) {
      log("JP×AR obfuscation error:", e.message);
      await ctx.reply(`❌ ${e.message}`);
    } finally {
      if (await fs.pathExists(out)) await fs.remove(out);
    }
  });
};