const axios = require("axios");
const FormData = require("form-data");

async function uploadToUguu(buffer, filename) {
  const form = new FormData();
  form.append("files[]", buffer, { filename });

  const { data } = await axios.post("https://uguu.se/upload.php", form, {
    headers: form.getHeaders(),
  });

  if (data.files && data.files[0]) return data.files[0].url;
  else throw new Error("Gagal upload ke uguu.se");
}

module.exports = (bot) => {
  bot.command(["removebg", "rbg"], async (ctx) => {
    try {
      const replyMsg = ctx.message.reply_to_message;
      if (!replyMsg || !replyMsg.photo) return ctx.reply("Reply gambar yang ingin dihapus background-nya.");

      const fileId = replyMsg.photo.pop().file_id;
      const fileLink = await ctx.telegram.getFileLink(fileId);
      const res = await axios.get(fileLink.href, { responseType: "arraybuffer" });

      await ctx.reply("Menghapus background, mohon tunggu...");

      const filename = `removebg_${Date.now()}.jpg`;
      const imageUrl = await uploadToUguu(res.data, filename);

      const apiUrl = `https://api.botcahx.eu.org/api/tools/removebg?apikey=sokepxyz&url=${encodeURIComponent(imageUrl)}`;
      const apiRes = await axios.get(apiUrl);
      const result = apiRes.data;

      if (!result?.status || !result.url) {
        throw new Error("Gagal menghapus background");
      }

      await ctx.replyWithPhoto({ url: result.url }, {
        caption: "Background berhasil dihapus ✅",
      });

    } catch (err) {
      console.error("RemoveBG Error:", err);
      ctx.reply(typeof err === "string" ? err : (err.message || "Terjadi kesalahan"));
    }
  });
};