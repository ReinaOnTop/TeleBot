const fs = require("fs-extra");
const path = require("path");
const fetch = require("node-fetch");
const JsConfuser = require("js-confuser");

const jp = ["あ","い","う","え","お","か","き","く","け","こ","さ","し","す","せ","そ","た","ち","つ","て","と","な","に","ぬ","ね","の","は","ひ","ふ","へ","ほ","ま","み","む","め","も","や","ゆ","よ","ら","り","る","れ","ろ","わ","を","ん"];
const genJP=()=>Array.from({length:Math.floor(Math.random()*4)+3},()=>jp[Math.floor(Math.random()*jp.length)]).join("");
const getJPObf=()=>({target:"node",compact:true,renameVariables:true,renameGlobals:true,identifierGenerator:genJP,stringEncoding:true,stringSplitting:true,controlFlowFlattening:0.9,flatten:true,shuffle:true,duplicateLiteralsRemoval:true,deadCode:true,calculator:true,opaquePredicates:true,lock:{selfDefending:true,antiDebug:true,integrity:true,tamperProtection:true}});

const log=(...a)=>console.log(new Date().toISOString(),...a);
const bar=p=>{const t=20,f=Math.round(p/5);return "["+"█".repeat(f)+" ".repeat(t-f)+`] ${p}%`};
const upd=(ctx,m,p,l)=>ctx.telegram.editMessageText(ctx.chat.id,m.message_id,undefined,"```Saturn 🪐\n🔒 EncryptBot\n ⚙️ "+l+" ("+p+"%)\n "+bar(p)+"\n```",{parse_mode:"Markdown"});

module.exports=bot=>{
  bot.command("encjapan",async ctx=>{
    const d=ctx.message.reply_to_message?.document;
    if(!d||!d.file_name.endsWith(".js")) return ctx.replyWithMarkdown("❌ *Balas file .js dengan `/encjapan`*");

    const tmp=path.join(__dirname,`saturn-encrypted-${d.file_name}`);
    try{
      const prog=await ctx.replyWithMarkdown("```Saturn 🪐\n🔒 EncryptBot\n ⚙️ Memulai (Hardened Japan) (1%)\n "+bar(1)+"\n```");

      const raw=await (await fetch(await ctx.telegram.getFileLink(d.file_id))).text();
      await upd(ctx,prog,20,"Mengunduh Selesai");
      new Function(raw);                           await upd(ctx,prog,30,"Memvalidasi");

      const obf=await JsConfuser.obfuscate(raw,getJPObf());
      const code=typeof obf==="string"?obf:obf.code;
      await upd(ctx,prog,60,"Transformasi");
      await fs.writeFile(tmp,code);                await upd(ctx,prog,80,"Finalisasi");

      new Function(code);
      await ctx.replyWithDocument({source:tmp,filename:`saturn-encrypted-${d.file_name}`},{caption:"✅ *Japan encrypted!*",parse_mode:"Markdown"});
      await upd(ctx,prog,100,"Selesai");
    }catch(e){log(e);ctx.reply(`❌ ${e.message}`);}
    finally{if(await fs.pathExists(tmp)) await fs.remove(tmp);}
  });
};