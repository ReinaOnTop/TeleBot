const axios = require('axios');

async function Terabox(link) {
  try {
    if (!/^https:\/\/(1024)?terabox\.com\/s\//.test(link)) {
      return { error: '❌ Link tidak valid! Harus dari terabox.com atau 1024terabox.com' };
    }

    const res = await axios.post('https://teraboxdownloader.online/api.php',
      { url: link },
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://teraboxdownloader.online',
          'Referer': 'https://teraboxdownloader.online/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': '*/*'
        }
      }
    );

    const data = res.data;
    if (!data?.direct_link) {
      return { error: '❌ Tidak ada link download ditemukan.', debug: data };
    }

    return {
      file_name: data.file_name,
      size: data.size,
      size_bytes: data.sizebytes,
      direct_link: data.direct_link,
      thumb: data.thumb
    };

  } catch (err) {
    return { error: '❌ Gagal mengakses web.', detail: err.message };
  }
}

module.exports = (bot) => {
  bot.command(['terabox'], async (ctx) => {
    const text = ctx.message.text.split(' ').slice(1).join(' ');
    if (!text) return ctx.reply('🚫 Contoh: /terabox https://terabox.com/s/xxxxxx');

    const res = await Terabox(text.trim());

    if (res.error) {
      return ctx.reply(res.error);
    }

    const caption = `📦 *${res.file_name}*\n🗂 Size: *${res.size}*\n🔗 [Download](${res.direct_link})`;

    return ctx.replyWithPhoto({ url: res.thumb }, {
      caption,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
  });

  // support .terabox via on('text')
  bot.hears(/^\.terabox (.+)/i, async (ctx) => {
    const link = ctx.match[1];
    const res = await Terabox(link.trim());

    if (res.error) {
      return ctx.reply(res.error);
    }

    const caption = `📦 *${res.file_name}*\n🗂 Size: *${res.size}*\n🔗 [Download](${res.direct_link})`;

    return ctx.replyWithPhoto({ url: res.thumb }, {
      caption,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
  });
};