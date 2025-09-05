const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');
const cheerio = require('cheerio');
const FormData = require('form-data');

// Universal fetch import (Node <18 and >=18)
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const jar = new CookieJar();
const client = wrapper(
  axios.create({
    jar,
    withCredentials: true,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      Accept: 'application/json, text/html, */*'
    }
  })
);

// Safely unwrap HTML from various response shapes
function asHtmlString(payload) {
  if (typeof payload === 'string') return payload;
  if (payload && typeof payload === 'object') {
    return (
      payload.data || // common JSON shape
      payload.html || // sometimes servers send { html: '...' }
      payload.body || // alt key
      payload.content || // alt key
      ''
    );
  }
  return '';
}

function parseDownloadLinks(html) {
  const $ = cheerio.load(html);
  const results = [];

  // Primary selector (old layout)
  $('#download-block a').each((i, el) => {
    const href = $(el).attr('href') || '';
    const name = $(el).text().trim();
    if (href.includes('/dl?token=') && name) {
      results.push({ name, url: `https://aplmate.com${href}` });
    }
  });

  // Fallback: any anchor with /dl?token= anywhere in the page
  if (!results.length) {
    $('a[href*="/dl?token="]').each((i, el) => {
      const href = $(el).attr('href') || '';
      const name = $(el).text().trim() || 'Download';
      results.push({ name, url: `https://aplmate.com${href}` });
    });
  }

  return results;
}

class AppleMusic {
  async getToken(url, siteKey, type, proxy) {
    const apiUrl = `https://anabot.my.id/api/tools/bypass?url=${encodeURIComponent(
      url
    )}&siteKey=${encodeURIComponent(siteKey)}&type=${encodeURIComponent(
      type
    )}&proxy=${encodeURIComponent(proxy)}&apikey=freeApikey`;

    try {
      const res = await fetch(apiUrl, { method: 'GET', headers: { Accept: 'application/json' } });
      const json = await res.json();

      console.log('Bypass response:', JSON.stringify(json, null, 2));

      // Support multiple shapes
      return (
        json?.data?.result?.token ||
        json?.result?.token ||
        json?.token ||
        null
      );
    } catch (err) {
      console.error('getToken error:', err);
      return null;
    }
  }

  async getHiddenField() {
    const res = await client.get('https://aplmate.com/');
    const html = asHtmlString(res.data);
    const $ = cheerio.load(html);
    const input = $('input[name^="_"][type="hidden"]');
    const name = input.attr('name');
    const value = (input.val() || '').trim();
    if (!name || !value) throw new Error('Hidden field tidak ditemukan / kosong');
    return { name, value };
  }

  async download(url) {
    const { name, value } = await this.getHiddenField();

    const turnstileToken = await this.getToken(
      'https://aplmate.com/',
      '0x4AAAAAABdqfzl6we62dQyp',
      'turnstile-min',
      ''
    );
    if (!turnstileToken) throw new Error('gagal dapat turnstile token');

    const form = new FormData();
    form.append('url', url);
    form.append(name, value);
    form.append('cf-turnstile-response', turnstileToken);

    const res = await client.post('https://aplmate.com/action', form, {
      headers: {
        ...form.getHeaders(),
        Origin: 'https://aplmate.com',
        Referer: 'https://aplmate.com/'
      }
    });

    // /action usually returns JSON with { html: '...' }
    const stepHtml = asHtmlString(res.data);
    const $ = cheerio.load(stepHtml);
    const data = $('input[name="data"]').val();
    const base = $('input[name="base"]').val();
    const token = $('input[name="token"]').val();

    if (!data || !base || !token) {
      console.log('Action step HTML (first 500):', stepHtml.slice(0, 500));
      throw new Error('Form parameter dari /action tidak lengkap');
    }

    return await this.getDataDownload({ data, base, token });
  }

  async getDataDownload({ data, base, token }) {
    const form = new FormData();
    form.append('data', data);
    form.append('base', base);
    form.append('token', token);

    const resp = await client.post('https://aplmate.com/action/track', form, {
      headers: {
        ...form.getHeaders(),
        Origin: 'https://aplmate.com',
        Referer: 'https://aplmate.com/'
      }
    });

    // /action/track often returns JSON with { data: '<html...>' }
    const html = asHtmlString(resp.data);

    // Safe debug preview
    console.log('Track HTML (first 500 chars):', (html || '').slice(0, 500));

    if (!html) {
      throw new Error('Respon tidak valid dari /action/track');
    }

    return parseDownloadLinks(html);
  }
}

module.exports = (bot) => {
  bot.command(['applemusic'], async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    const url = args[0];

    if (!url) {
      return ctx.reply('Contoh: /applemusic https://music.apple.com/track-url', {
        reply_to_message_id: ctx.message.message_id
      });
    }

    try {
      await ctx.reply('🔄 Sedang diproses...', { reply_to_message_id: ctx.message.message_id });

      const dl = new AppleMusic();
      const result = await dl.download(url);

      if (!result.length) throw new Error('Gagal mendapatkan link download.');

      const audio = result.find((v) => v.name.toLowerCase().includes('mp3')) || result[0];

      await ctx.replyWithAudio({ url: audio.url }, { reply_to_message_id: ctx.message.message_id });
    } catch (e) {
      console.error('applemusic error:', e);
      ctx.reply(`❌ Error: ${e.message}`, { reply_to_message_id: ctx.message.message_id });
    }
  });
};