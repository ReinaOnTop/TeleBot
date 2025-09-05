const { toMp3 } = require('../lib/converter');
const fetch = require('node-fetch');

module.exports = (bot) => {
  bot.command(['tomp3','toaudio'], async (ctx) => {
    try {
      const msg = ctx.message?.reply_to_message;
      if (!msg) return ctx.reply(`Balas video/audio dengan perintah /toaudio / /toaudio`);

      const fileId =
        msg.audio?.file_id ||
        msg.voice?.file_id ||
        msg.video?.file_id ||
        msg.document?.file_id;

      if (!fileId) return ctx.reply('Media tidak dikenali. Balas file audio/video.');

      const fileLink = await bot.telegram.getFileLink(fileId);
      const res = await fetch(fileLink.href);
      const buffer = await res.buffer();

      if (!buffer || buffer.length < 1000) {
        return ctx.reply('❌ File terlalu kecil atau gagal diunduh.');
      }

      const audio = await toMp3(buffer, 'mp4'); // asumsi input .mp4/audio
      if (!audio?.data) return ctx.reply('❌ Gagal konversi ke mp3.');

      await ctx.replyWithDocument({ source: audio.data, filename: 'output.mp3' });

    } catch (err) {
      console.error('tomp3 error:', err);
      ctx.reply('Terjadi kesalahan saat konversi ke MP3.');
    }
  });
};