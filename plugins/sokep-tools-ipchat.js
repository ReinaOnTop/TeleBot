module.exports = (bot) => {
  bot.command(['imessage', 'iphonechat', 'iphone-chat'], async (ctx) => {
    const text = ctx.message.text.split(' ').slice(1).join(' ');
    if (!text) return ctx.reply('Masukkan teks untuk iMessage!\n\nContoh:\n/imessage aku sayang kamu');

    try {
      const url = `https://api.ditss.cloud/imageCreator/imessage?text=${encodeURIComponent(text)}`;
      await ctx.replyWithPhoto(url, {
        caption: `📱 *iMessage Style*\n\n"${text}"`,
        parse_mode: 'Markdown'
      });
    } catch (err) {
      console.error('Error iMessage:', err);
      ctx.reply('⚠️ Gagal membuat gambar iMessage. Coba lagi nanti.');
    }
  });
};