
const axios = require('axios');
const cheerio = require('cheerio');

async function mediafireDl(url) {
  // Try API method first (more reliable)
  try {
    console.log("📡 Trying API method...");
    const apiRes = await axios.get(`https://api.siputzx.my.id/api/d/mediafire?url=${encodeURIComponent(url)}`, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (apiRes.data && apiRes.data.data && apiRes.data.data.url) {
      const data = apiRes.data.data;
      return {
        url: data.url,
        filename: data.filename || data.nama || 'mediafire_file',
        filesize: data.filesize || data.size || 'Unknown'
      };
    }
  } catch (apiError) {
    console.log("📡 API method failed, trying direct method...");
  }

  // Fallback to direct scraping with improved anti-detection
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none'
      },
      maxRedirects: 5,
      validateStatus: () => true
    });

    console.log("📡 Mediafire status:", res.status);

    if (res.status !== 200) {
      throw new Error(`MediaFire returned status ${res.status}`);
    }

    if (typeof res.data !== 'string') {
      console.log("📡 Non-string body:", res.data);
      throw new Error("Mediafire response was not HTML");
    }

    const html = res.data;
    const $ = cheerio.load(html);

    // Multiple selectors to find download link
    let link = null;

    // First, try to extract direct download URLs from scripts/variables
    const downloadPatterns = [
      /https:\/\/download\d+\.mediafire\.com\/[^'"\s]+/g,
      /"(https:\/\/download\d+\.mediafire\.com\/[^"]+)"/g,
      /'(https:\/\/download\d+\.mediafire\.com\/[^']+)'/g,
      /window\.location\.href\s*=\s*['"]([^'"]+)['"]/g,
      /location\.replace\(['"]([^'"]+)['"]\)/g
    ];

    for (const pattern of downloadPatterns) {
      const matches = html.match(pattern);
      if (matches) {
        for (const match of matches) {
          const urlMatch = match.match(/https:\/\/download\d+\.mediafire\.com\/[^'"\s]+/);
          if (urlMatch) {
            link = urlMatch[0];
            console.log("✅ Found direct download URL in content");
            break;
          }
        }
        if (link) break;
      }
    }

    // If no direct link found, try selectors (but filter out javascript: URLs)
    if (!link) {
      const selectors = [
        '#downloadButton',
        '.download_link .input',
        'a.input[href*="download"]',
        'a[href*="/download/"]',
        'a[aria-label="Download file"]',
        '.dl-btn-label'
      ];

      for (const selector of selectors) {
        const element = $(selector);
        if (element.length > 0) {
          const href = element.attr('href');
          if (href && !href.startsWith('javascript:') && href.includes('http')) {
            link = href;
            console.log(`✅ Found valid link with selector: ${selector}`);
            break;
          }
        }
      }
    }

    // Last resort: look for any download links in the page
    if (!link) {
      $('a[href]').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.includes('download') && href.startsWith('http') && !href.startsWith('javascript:')) {
          link = href;
          console.log("✅ Found download link in anchor tags");
          return false; // break
        }
      });
    }

    if (!link || link.startsWith('javascript:')) {
      console.log("⚠️ Mediafire HTML snippet:", html.slice(0, 2000));
      console.log("⚠️ Available links found:");
      $('a[href]').each((i, el) => {
        const href = $(el).attr('href');
        if (href && (href.includes('download') || href.includes('mediafire'))) {
          console.log(`  - ${href}`);
        }
      });
      throw new Error("Download link tidak ditemukan atau tidak valid di halaman Mediafire");
    }

    // Ensure the link is absolute and valid
    if (link && !link.startsWith('http')) {
      if (link.startsWith('//')) {
        link = 'https:' + link;
      } else if (link.startsWith('/')) {
        link = 'https://www.mediafire.com' + link;
      }
    }

    // Final validation - must be a valid HTTP URL
    if (!link.startsWith('http')) {
      throw new Error("URL download tidak valid");
    }

    // Extract filename (clean up duplicates)
    let filename = 
      $('.filename').text().trim() ||
      $('.dl-info .filename').text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      $('.file-title').text().trim() ||
      url.split('/').pop().split('?')[0] ||
      'mediafire_file';
    
    // Remove duplicate filename if it exists
    const words = filename.split(/\s+/);
    if (words.length > 1) {
      const uniqueWords = [...new Set(words)];
      if (uniqueWords.length < words.length) {
        filename = uniqueWords.join(' ');
      }
    }

    // Extract filesize (clean format)
    let filesize = 
      $('.details .fileInfo').text().trim() ||
      $('.file-info').text().trim() ||
      $('.dl-info .details').text().trim() ||
      $('span:contains("Size:")').next().text().trim() ||
      'Unknown';
    
    // Clean up filesize format
    const sizeMatch = filesize.match(/File size:\s*([^\n\r]+)/);
    if (sizeMatch) {
      filesize = sizeMatch[1].trim();
    }

    return { url: link, filename, filesize };

  } catch (error) {
    console.error("Direct method failed:", error);
    throw new Error(`MediaFire download failed: ${error.message}`);
  }
}

module.exports = (bot) => {
  bot.command(['mediafire', 'mf'], async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    const url = args[0];

    if (!url) {
      return ctx.reply('Contoh: /mediafire https://www.mediafire.com/file/abc123/file.apk', {
        reply_to_message_id: ctx.message.message_id
      });
    }

    // Validate MediaFire URL
    if (!url.includes('mediafire.com')) {
      return ctx.reply('❌ URL harus dari MediaFire!', {
        reply_to_message_id: ctx.message.message_id
      });
    }

    try {
      await ctx.reply('🔎 Sedang mengambil link Mediafire...', {
        reply_to_message_id: ctx.message.message_id
      });

      const file = await mediafireDl(url);

      await ctx.reply(
        `📦 *Name:* ${file.filename}\n📁 *Size:* ${file.filesize}\n🔗 *Direct Link:* [Download](${file.url})`,
        { 
          reply_to_message_id: ctx.message.message_id, 
          parse_mode: 'Markdown',
          disable_web_page_preview: true
        }
      );

      // Try to send as document with better handling
      try {
        // First check if file is too large or invalid
        const response = await axios.head(file.url, { timeout: 10000 });
        const contentLength = response.headers['content-length'];
        const fileSizeBytes = parseInt(contentLength);
        
        // Telegram file size limit is 50MB
        if (fileSizeBytes && fileSizeBytes > 50 * 1024 * 1024) {
          await ctx.reply(
            `📥 File terlalu besar untuk dikirim langsung (${(fileSizeBytes / 1024 / 1024).toFixed(2)} MB).\nSilakan unduh menggunakan link di atas.`,
            { reply_to_message_id: ctx.message.message_id }
          );
        } else {
          await ctx.replyWithDocument(
            { url: file.url, filename: file.filename },
            { reply_to_message_id: ctx.message.message_id }
          );
        }
      } catch (docError) {
        console.log("Failed to send as document:", docError.message);
        await ctx.reply(
          `📥 Tidak dapat mengirim file langsung. Silakan klik link di atas untuk mengunduh.`,
          { reply_to_message_id: ctx.message.message_id }
        );
      }
    } catch (err) {
      console.error("mediafire error:", err);
      ctx.reply(`❌ Terjadi kesalahan: ${err.message}`, {
        reply_to_message_id: ctx.message.message_id
      });
    }
  });
};
