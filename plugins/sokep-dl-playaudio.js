const yt = require("yt-search");
const axios = require("axios");

module.exports = (bot) => {
  bot.command(["play", "song", "ds"], async (ctx) => {
    const text = ctx.message.text.split(" ").slice(1).join(" ");
    if (!text) return ctx.reply("Please provide a YouTube title or link.");

    const escapeHtml = (text = "") =>
      text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    try {
      await ctx.reply("Searching for the song...");

      const result = await yt(text);
      const video = result.videos[0];
      if (!video) return ctx.reply("No video found.");
      if (video.seconds >= 3600) return ctx.reply("The video is longer than 1 hour.");

      const { data } = await axios.get(
        `https://api.botcahx.eu.org/api/dowloader/yt?url=${video.url}&apikey=sokepxyz`
      );

      if (!data?.result?.mp3) {
        return ctx.reply("Failed to retrieve the audio link.");
      }

      // Check file size (max 50MB for Telegram)
      const contentLength = await axios
        .head(data.result.mp3)
        .then((res) => parseInt(res.headers["content-length"], 10));

      if (contentLength > 50 * 1024 * 1024) {
        return ctx.reply("The audio file is too large to send (max 50MB).");
      }

      const caption = `
<b>Title:</b> ${escapeHtml(video.title)}
<b>Video ID:</b> ${video.videoId}
<b>Duration:</b> ${video.timestamp}
<b>Views:</b> ${video.views}
<b>Uploaded:</b> ${video.ago}
<b>Author:</b> ${escapeHtml(video.author.name)}
<b>URL:</b> <a href="${video.url}">${video.url}</a>
<b>Description:</b> ${escapeHtml(video.description || "-")}
      `.trim();

      await ctx.replyWithPhoto(
        { url: video.image },
        {
          caption,
          parse_mode: "HTML",
        }
      );

      await ctx.replyWithAudio(
        { url: data.result.mp3 },
        {
          title: video.title,
          performer: video.author.name,
          caption: escapeHtml(video.title),
          parse_mode: "HTML",
        }
      );
    } catch (err) {
      console.error(err);
      ctx.reply("An error occurred while processing your request.");
    }
  });
};