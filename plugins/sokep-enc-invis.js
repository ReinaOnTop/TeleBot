const fs   = require("fs-extra");
const path = require("path");
const fetch = require("node-fetch");
const JsConfuser = require("js-confuser");

/* INVISIBLE preset */
const genInvis = () => "_".repeat(Math.floor(Math.random()*4)+3) + Math.random().toString(36).slice(2,5);
const getInvisObf = () => ({
  target:"node",
  compact:true,
  renameVariables:true,
  renameGlobals:true,
  identifierGenerator:genInvis,
  stringEncoding:true,
  stringSplitting:true,
  controlFlowFlattening:0.95,
  shuffle:true,
  duplicateLiteralsRemoval:true,
  deadCode:true,
  calculator:true,
  opaquePredicates:true,
  lock:{ selfDefending:true, antiDebug:true, integrity:true, tamperProtection:true }
});

/* util mini */
const log = (...a)=>console.log(new Date().toISOString(),...a);
const bar = p=>{const t=20,f=Math.round(p/5);return "["+"█".repeat(f)+" ".repeat(t-f)+`] ${p}%`};
const upd = (ctx,m,p,l)=>ctx.telegram.editMessageText(
  ctx.chat.id,m.message_id,undefined,
  "```Saturn 🪐\n🔒 EncryptBot\n ⚙️ "+l+" ("+p+"%)\n "+bar(p)+"\n```",
  {parse_mode:"Markdown"}
);

module.exports = bot => {
  bot.command("encinvis", async ctx => {
    const doc = ctx.message.reply_to_message?.document;
    if(!doc || !doc.file_name.endsWith(".js"))
      return ctx.replyWithMarkdown("❌ *Balas file .js dengan `/encinvis`*");

    const out = path.join(__dirname,`saturn-encrypted-${doc.file_name}`);

    try{
      const prog = await ctx.replyWithMarkdown(
        "```Saturn 🪐\n🔒 EncryptBot\n ⚙️ Memulai (Hardened Invisible) (1%)\n "+bar(1)+"\n```"
      );

      const raw = await (await fetch(await ctx.telegram.getFileLink(doc.file_id))).text();
      await upd(ctx,prog,20,"Mengunduh Selesai");
      new Function(raw);                                   await upd(ctx,prog,30,"Memvalidasi");

      const obf  = await JsConfuser.obfuscate(raw,getInvisObf());
      const code = typeof obf==="string"?obf:obf.code;
      await upd(ctx,prog,60,"Transformasi Kode");
      await fs.writeFile(out,code);                        await upd(ctx,prog,80,"Finalisasi");

      new Function(code);
      await ctx.replyWithDocument(
        {source:out,filename:`saturn-encrypted-${doc.file_name}`},
        {caption:"✅ *Invisible encrypted siap!*",parse_mode:"Markdown"}
      );
      await upd(ctx,prog,100,"Selesai");
    }catch(e){
      log("Invis obfuscation error:",e.message);
      await ctx.reply(`❌ ${e.message}`);
    }finally{
      if(await fs.pathExists(out)) await fs.remove(out);
    }
  });
};