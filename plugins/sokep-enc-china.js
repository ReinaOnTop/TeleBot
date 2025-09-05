const fs = require("fs-extra");
const path = require("path");
const fetch = require("node-fetch");
const JsConfuser = require("js-confuser");

const mandarinChars = ["龙","虎","风","云","山","河","天","地","雷","电","火","水","木","金","土","星","月","日","光","影","峰","泉","林","海","雪","霜","雾","冰","焰","石"];
const genMandarin = () => Array.from({length:Math.floor(Math.random()*4)+3},()=>mandarinChars[Math.floor(Math.random()*mandarinChars.length)]).join("");
const getMandarinObf = () => ({target:"node",compact:true,renameVariables:true,renameGlobals:true,identifierGenerator:genMandarin,stringEncoding:true,stringSplitting:true,controlFlowFlattening:0.95,shuffle:true,duplicateLiteralsRemoval:true,deadCode:true,calculator:true,opaquePredicates:true,lock:{selfDefending:true,antiDebug:true,integrity:true,tamperProtection:true}});

const log = (...a)=>console.log(new Date().toISOString(),...a);
const bar = p=>{const t=20,f=Math.round(p/5);return "["+"█".repeat(f)+" ".repeat(t-f)+`] ${p}%`};
const upd = (ctx,m,p,l)=>ctx.telegram.editMessageText(ctx.chat.id,m.message_id,undefined,"```Saturn 🪐\n🔒 EncryptBot\n ⚙️ "+l+" ("+p+"%)\n "+bar(p)+"\n```",{parse_mode:"Markdown"});

module.exports = bot=>{
  bot.command("encchina",async ctx=>{
    const d=ctx.message.reply_to_message?.document;
    if(!d||!d.file_name.endsWith(".js")) return ctx.replyWithMarkdown("❌ *Balas file .js dengan `/encchina`*");

    const tmp=path.join(__dirname,`saturn-encrypted-${d.file_name}`);
    try{
      const prog=await ctx.replyWithMarkdown("```Saturn 🪐\n🔒 EncryptBot\n ⚙️ Memulai (Hardened Mandarin) (1%)\n "+bar(1)+"\n```");

      const raw=await (await fetch(await ctx.telegram.getFileLink(d.file_id))).text();
      await upd(ctx,prog,20,"Mengunduh Selesai");
      new Function(raw);                           await upd(ctx,prog,30,"Memvalidasi");

      const obf=await JsConfuser.obfuscate(raw,getMandarinObf());
      const code=typeof obf==="string"?obf:obf.code;
      await upd(ctx,prog,60,"Transformasi");
      await fs.writeFile(tmp,code);                await upd(ctx,prog,80,"Finalisasi");

      new Function(code);
      await ctx.replyWithDocument({source:tmp,filename:`saturn-encrypted-${d.file_name}`},{caption:"✅ *Mandarin encrypted!*",parse_mode:"Markdown"});
      await upd(ctx,prog,100,"Selesai");
    }catch(e){log(e);ctx.reply(`❌ ${e.message}`)}
    finally{if(await fs.pathExists(tmp)) await fs.remove(tmp);}
  });
};