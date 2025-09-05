const fs    = require("fs-extra");
const path  = require("path");
const fetch = require("node-fetch");
const JsConfuser = require("js-confuser");

/* ── STRONG preset ── */
const getStrongObf = () => ({
  target:"node",
  compact:true,
  renameVariables:true,
  renameGlobals:true,
  identifierGenerator:"randomized",
  stringEncoding:true,
  stringSplitting:true,
  controlFlowFlattening:0.75,
  shuffle:true,
  duplicateLiteralsRemoval:true,
  calculator:true,
  dispatcher:true,
  deadCode:true,
  opaquePredicates:true,
  lock:{ selfDefending:true, antiDebug:true, integrity:true, tamperProtection:true }
});

/* ── util mini ── */
const stamp = (...x)=>console.log(new Date().toISOString(),...x);
const bar   = p=>{const t=20,f=Math.round(p/5);return "["+"█".repeat(f)+" ".repeat(t-f)+`] ${p}%`};
const upd   = (ctx,m,p,l)=>ctx.telegram.editMessageText(
  ctx.chat.id,m.message_id,undefined,
  "```Saturn 🪐\n🔒 EncryptBot\n ⚙️ "+l+" ("+p+"%)\n "+bar(p)+"\n```",
  {parse_mode:"Markdown"}
);

/* ── plugin ── */
module.exports = bot => {
  bot.command("encstrong", async ctx => {
    const doc = ctx.message.reply_to_message?.document;
    if(!doc || !doc.file_name.endsWith(".js"))
      return ctx.replyWithMarkdown("❌ *Balas file .js dengan `/encstrong`*");

    const out = path.join(__dirname,`saturn-strong-encrypted-${doc.file_name}`);

    try {
      const prog = await ctx.replyWithMarkdown(
        "```Saturn 🪐\n🔒 EncryptBot\n ⚙️ Memulai (Hardened Strong) (1%)\n "+bar(1)+"\n```"
      );

      const raw = await (await fetch(await ctx.telegram.getFileLink(doc.file_id))).text();
      await upd(ctx,prog,20,"Mengunduh Selesai");
      new Function(raw);                             await upd(ctx,prog,30,"Memvalidasi");

      const obf  = await JsConfuser.obfuscate(raw,getStrongObf());
      const code = typeof obf==="string"?obf:obf.code;
      await upd(ctx,prog,60,"Transformasi");
      await fs.writeFile(out,code);                  await upd(ctx,prog,80,"Finalisasi");

      new Function(code);
      await ctx.replyWithDocument(
        { source: out, filename: `saturn-strong-encrypted-${doc.file_name}` },
        { caption: "✅ *Hardened Strong encrypted!* — SATURN 🔥", parse_mode:"Markdown" }
      );
      await upd(ctx,prog,100,"Selesai");
    }catch(e){
      stamp("Strong obfuscation error:",e.message);
      await ctx.reply(`❌ ${e.message}`);
    }finally{
      if(await fs.pathExists(out)) await fs.remove(out);
    }
  });
};