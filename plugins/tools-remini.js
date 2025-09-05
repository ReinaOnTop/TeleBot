const fetch = require('node-fetch');
const uploadImage = require('../lib/uploadImage');
const wm = '🤓';

module.exports = (bot) => {
  const commands = ['remini', 'hd'];

  // Fungsi: ambil ID pesan yang harus dibalas
  const getReplyTarget = (ctx) =>
    ctx.message?.reply_to_message?.message_id || ctx.message?.message_id;

  const handleRemini = async (ctx) => {
    try {
      const msg = ctx.message;
      const replied = msg?.reply_to_message;
      const target = replied?.photo ? replied : msg;

      const photo = target?.photo?.pop();
      if (!photo) {
        return ctx.reply('Kirim atau balas gambar dengan command tersebut', {
          reply_to_message_id: getReplyTarget(ctx)
        });
      }

      // ⏳ Kirim pesan loading
      const loadingMsg = await ctx.reply('⏳ Sedang memproses gambar...', {
        reply_to_message_id: getReplyTarget(ctx)
      });

      const fileLink = await bot.telegram.getFileLink(photo.file_id);
      const res = await fetch(fileLink.href);
      const buffer = await res.buffer();

      const uploadedUrl = await uploadImage(buffer);
      if (!uploadedUrl) {
        return ctx.reply('Gagal upload.', {
          reply_to_message_id: getReplyTarget(ctx)
        });
      }

      const apiRes = await fetch(`https://api.botcahx.eu.org/api/tools/remini?url=${uploadedUrl}&apikey=${global.apikey}`);
      const json = await apiRes.json();

      if (!json?.url) {
        return ctx.reply('Gagal mendapatkan hasil dari API.', {
          reply_to_message_id: getReplyTarget(ctx)
        });
      }

      // Hapus pesan loading
      await ctx.deleteMessage(loadingMsg.message_id).catch(() => {});

      // Reply hasil ke user
      await ctx.replyWithPhoto({ url: json.url }, {
        caption: wm,
        reply_to_message_id: getReplyTarget(ctx)
      });

    } catch (err) {
      console.error('remini error:', err);
      ctx.reply('Terjadi kesalahan saat memproses gambar.', {
        reply_to_message_id: getReplyTarget(ctx)
      });
    }
  };

  // Command: /remini /hd
  bot.command(commands, handleRemini);

  // Caption gambar: "remini", "/hd"
  bot.on('photo', async (ctx) => {
    const caption = ctx.message.caption?.toLowerCase().trim();
    if (caption && commands.includes(caption.replace('/', ''))) {
      await handleRemini(ctx);
    }
  });

  // Reply ke foto pakai teks: remini / hd
  bot.hears(/^\/?(remini|hd)$/i, async (ctx) => {
    if (ctx.message?.reply_to_message?.photo) {
      await handleRemini(ctx);
    }
  });
};