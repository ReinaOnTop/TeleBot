const axios = require('axios');
const FormData = require('form-data');

// Upload gambar ke Uguu.se
async function uploadToUguu(buffer, filename) {
  const form = new FormData();
  form.append('files[]', buffer, { filename });

  const { data } = await axios.post('https://uguu.se/upload.php', form, {
    headers: form.getHeaders(),
  });

  if (data?.files?.[0]?.url) {
    return data.files[0].url;
  } else {
    throw new Error('❌ Gagal upload, coba lagi nanti.');
  }
}

// Plugin utama
module.exports = bot => {
  bot.command('hytamkan', async ctx => {
    try {
      const reply = ctx.message.reply_to_message;
      if (!reply || !reply.photo) {
        return await ctx.reply('Balas gambar yang ingin dihytamkan.');
      }

      await ctx.reply('⏳');

      const photo = reply.photo[reply.photo.length - 1];
      const fileLink = await ctx.telegram.getFileLink(photo.file_id);

      const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      const filename = `hitam_${Date.now()}.jpg`;

      const imageUrl = await uploadToUguu(buffer, filename);

      const apiUrl = `https://api.botcahx.eu.org/api/maker/jadihitam?apikey=${global.apikey}&url=${encodeURIComponent(imageUrl)}`;
      const result = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      await ctx.replyWithPhoto({ source: Buffer.from(result.data) }, {
        caption: 'Gambar berhasil dihitamkan!'
      });

    } catch (err) {
      console.error(err);
      await ctx.reply(typeof err === 'string' ? err : (err.message || '❌ Terjadi kesalahan saat memproses gambar.'));
    }
  });
};