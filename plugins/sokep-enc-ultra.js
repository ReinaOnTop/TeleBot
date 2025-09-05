const fs    = require("fs-extra");
const path  = require("path");
const fetch = require("node-fetch");
const JsConfuser = require("js-confuser");

/* ── PRESET ULTRA ── */
const getUltraObf = () => {
  const idGen = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const nums  = "0123456789";
    return "z" + nums[Math.floor(Math.random()*nums.length)] +
           chars[Math.floor(Math.random()*chars.length)] +
           Math.random().toString(36).slice(2,6);
  };
  return {
    target:"node",
    compact:true,
    renameVariables:true,
    renameGlobals:true,
    identifierGenerator:idGen,
    stringCompression:true,
    stringEncoding:true,
    stringSplitting:true,
    controlFlowFlattening:0.9,
    flatten:true,
    shuffle:true,
    rgf:true,
    deadCode:true,
    opaquePredicates:true,
    dispatcher:true,
    lock:{ selfDefending:true, antiDebug:true, integrity:true, tamperProtection:true }
  };
};

/* ── UTIL ── */
const log = (...a)=>console.log(new Date().toISOString(),...a);
const bar = p=>{const t=20,f=Math.round(p/5);return "["+"█".repeat(f)+" ".repeat(t-f)+`] ${p}%`;};
const upd = (ctx,m,p,l)=>ctx.telegram.editMessageText(
  ctx.chat.id,m.message_id,undefined,
  "```Saturn 🪐\n🔒 EncryptBot\n ⚙️ "+l+" ("+p+"%)\n "+bar(p)+"\n```",
  {parse_mode:"Markdown"}
);

/* ── PLUGIN ── */
module.exports = bot => {
  bot.command("encultra", async ctx => {
    const doc = ctx.message.reply_to_message?.document;
    if(!doc || !doc.file_name.endsWith(".js"))
      return ctx.replyWithMarkdown("❌ *Balas file .js dengan `/encultra`*");

    const out = path.join(__dirname,`saturn-ultra-encrypted-${doc.file_name}`);

    try{
      const prog = await ctx.replyWithMarkdown(
        "```Saturn 🪐\n🔒 EncryptBot\n ⚙️ Memulai (Hardened Ultra) (1%)\n "+bar(1)+"\n```"
      );

      const raw = await (await fetch(await ctx.telegram.getFileLink(doc.file_id))).text();
      await upd(ctx,prog,20,"Mengunduh Selesai");
      new Function(raw);                               await upd(ctx,prog,30,"Memvalidasi");

      const obf  = await JsConfuser.obfuscate(raw,getUltraObf());
      const code = typeof obf==="string"?obf:obf.code;
      await upd(ctx,prog,60,"Transformasi");
      await fs.writeFile(out,code);                    await upd(ctx,prog,80,"Finalisasi");

      new Function(code);
      await ctx.replyWithDocument(
        { source: out, filename: `saturn-ultra-encrypted-${doc.file_name}` },
        { caption: "✅ *Hardened Ultra encrypted!* — SATURN 🔥", parse_mode:"Markdown" }
      );
      await upd(ctx,prog,100,"Selesai");
    }catch(e){
      log("Ultra obfuscation error:",e.message);
      await ctx.reply(`❌ ${e.message}`);
    }finally{
      if(await fs.pathExists(out)) await fs.remove(out);
    }
  });
};