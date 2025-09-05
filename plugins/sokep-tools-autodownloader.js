const axios = require("axios");
const fetch = require("node-fetch");

module.exports = (bot) => {
  bot.use(async (ctx, next) => {
    try {
      const text = ctx.message?.text?.trim();
      if (!text) return next();

      const urlRegex = /^https?:\/\/[^\s]+$/i;
      if (!urlRegex.test(text)) return next();

      const url = text;
      await ctx.reply("⏳ Tunggu sebentar, sedang diproses...");

      if (url.includes("youtube.com") || url.includes("youtu.be")) return await handleYouTube(ctx, url);
      if (url.includes("twitter.com") || url.includes("x.com")) return await handleTwitter(ctx, url);
      if (url.includes("tiktok.com") || url.includes("vt.tiktok.com")) return await handleTikTok(ctx, url);
      if (url.includes("instagram.com") || url.includes("instagr.am")) return await handleInstagram(ctx, url);
      if (url.includes("facebook.com") || url.includes("fb.watch")) return await handleFacebook(ctx, url);
      if (url.includes("spotify.com") && url.includes("track")) return await handleSpotify(ctx, url);

      return next();
    } catch (err) {
      console.error("❌ AutoDownloader Error:", err);
      return ctx.reply("⚠️ Terjadi kesalahan saat memproses link.");
    }
  });
};

// === Handler ===

async function handleYouTube(ctx, url) {
  try {
    const { data } = await axios.get(`https://api.ownblox.my.id/api/ytdl?url=${encodeURIComponent(url)}&type=mp4`);
    const result = data?.result;
    if (!result?.video_download) throw "Gagal mendapatkan video.";

    await ctx.replyWithVideo({ url: result.video_download }, {
      caption: `📽 *Judul:* ${result.title}\n🎞 *Kualitas:* ${result.quality}\n⏱ *Durasi:* ${result.duration} detik`,
      parse_mode: "Markdown"
    });
  } catch (e) {
    console.error("YouTube Error:", e);
    await ctx.reply("❌ Gagal mengunduh video YouTube.");
  }
}

async function handleTwitter(ctx, url) {
  try {
    const { data } = await axios.get(`https://api.ownblox.my.id/api/twitterdl?url=${encodeURIComponent(url)}`);
    const videoUrl = data?.download_link?.[0];
    if (!videoUrl) throw "Video Twitter tidak ditemukan.";

    await ctx.replyWithVideo({ url: videoUrl }, { caption: "✅ Video Twitter berhasil diunduh!" });
  } catch (e) {
    console.error("Twitter Error:", e);
    await ctx.reply("❌ Gagal mengunduh video Twitter.");
  }
}

async function handleTikTok(ctx, url) {
  try {
    const { data } = await axios.get(`https://api.ownblox.my.id/api/ttdl?url=${encodeURIComponent(url)}`);
    const { video, title, author } = data?.result || {};
    if (!video) throw "Video TikTok tidak ditemukan.";

    await ctx.replyWithVideo({ url: video }, {
      caption: `🎥 *${title}*\n👤 ${author}`,
      parse_mode: "Markdown"
    });
  } catch (e) {
    console.error("TikTok Error:", e);
    await ctx.reply("❌ Gagal mengunduh video TikTok.");
  }
}

async function handleInstagram(ctx, url) {
  try {
    const res = await fetch(`https://api.siputzx.my.id/api/d/igdl?url=${url}`);
    const json = await res.json();
    if (!json?.data?.length) throw "Media Instagram tidak ditemukan.";

    for (const media of json.data) {
      if (media.url.includes(".mp4")) {
        await ctx.replyWithVideo({ url: media.url });
      } else {
        await ctx.replyWithPhoto({ url: media.url });
      }
    }
  } catch (e) {
    console.error("Instagram Error:", e);
    await ctx.reply("❌ Gagal mengunduh media Instagram.");
  }
}

async function handleFacebook(ctx, url) {
  try {
    const { data } = await axios.get(`https://api.ownblox.my.id/api/fbdl?url=${encodeURIComponent(url)}`);
    if (!data?.download_link) throw "Video Facebook tidak ditemukan.";

    await ctx.replyWithVideo({ url: data.download_link }, {
      caption: "✅ Video Facebook berhasil diunduh!"
    });
  } catch (e) {
    console.error("Facebook Error:", e);
    await ctx.reply("❌ Gagal mengunduh video Facebook.");
  }
}

async function handleSpotify(ctx, url) {
  try {
    const res = await fetch(`https://fastrestapis.fasturl.cloud/downup/spotifydown?url=${encodeURIComponent(url)}`);
    const json = await res.json();
    const { title, artists, cover } = json.result?.metadata || {};
    const audioUrl = json.result?.link;
    if (!audioUrl) throw "Audio Spotify tidak ditemukan.";

    await ctx.replyWithAudio({ url: audioUrl }, {
      title: title || "Lagu",
      performer: artists || "Spotify",
      // ❌ remove invalid thumb field → 'thumb' is not accepted this way in Telegram API
    });
  } catch (e) {
    console.error("Spotify Error:", e);
    await ctx.reply("❌ Gagal mengunduh lagu dari Spotify.");
  }
}