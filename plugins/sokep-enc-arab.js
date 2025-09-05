const fs = require("fs-extra");
const path = require("path");
const fetch = require("node-fetch");
const JsConfuser = require("js-confuser");

const arab = ["أ","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي"];
const genArab = () => Array.from({length:Math.floor(Math.random()*4)+3},()=>arab[Math.floor(Math.random()*arab.length)]).join("");
const getArabObf = () => ({target:"node",compact:true,renameVariables:true,renameGlobals:true,identifierGenerator:genArab,stringEncoding:true,stringSplitting:true,controlFlowFlattening:0.95,shuffle:true,duplicateLiteralsRemoval:true,deadCode:true,calculator:true,opaquePredicates:true,lock:{selfDefending:true,antiDebug:true,integrity:true,tamperProtection:true}});

const log=(...a)=>console.log(new Date().toISOString(),...a);
const bar=p=>{const t=20,f=Math.round(p/5);return "["+"█".repeat(f)+" ".repeat(t-f)+`] ${p}%`};
const upd=(ctx,m,p,l)=>ctx.telegram.editMessageText(ctx.chat.id,m.message_id,undefined,"```Saturn 🪐\n🔒 EncryptBot\n ⚙️ "+l+" ("+p+"%)\n "+bar(p)+"\n```",{parse_mode:"Markdown"});

module.exports=bot=>{
  bot.command("encarab",async ctx=>{
    const d=ctx.message.reply_to_message?.document;
    if(!d||!d.file_name.endsWith(".js")) return ctx.replyWithMarkdown("❌ *Balas file .js dengan `/encarab`*");

    const tmp=path.join(__dirname,`saturn-encrypted-${d.file_name}`);
    try{
      const prog=await ctx.replyWithMarkdown("```Saturn 🪐\n🔒 EncryptBot\n ⚙️ Memulai (Hardened Arab) (1%)\n "+bar(1)+"\n```");

      const raw=await (await fetch(await ctx.telegram.getFileLink(d.file_id))).text();
      await upd(ctx,prog,20,"Mengunduh Selesai");
      new Function(raw);                           await upd(ctx,prog,30,"Memvalidasi");

      const obf=await JsConfuser.obfuscate(raw,getArabObf());
      const code=typeof obf==="string"?obf:obf.code;
      await upd(ctx,prog,60,"Transformasi");
      await fs.writeFile(tmp,code);                await upd(ctx,prog,80,"Finalisasi");

      new Function(code);
      await ctx.replyWithDocument({source:tmp,filename:`saturn-encrypted-${d.file_name}`},{caption:"✅ *Arab encrypted!*",parse_mode:"Markdown"});
      await upd(ctx,prog,100,"Selesai");
    }catch(e){log(e);ctx.reply(`❌ ${e.message}`);}
    finally{if(await fs.pathExists(tmp)) await fs.remove(tmp);}
  });
};