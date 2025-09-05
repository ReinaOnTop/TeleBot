const axios = require("axios");

module.exports = (bot) => {
  bot.command("pakustad", async (ctx) => {
    const text = ctx.message.text.split(" ").slice(1).join(" ");
    if (!text) {
      return ctx.reply(`Contoh:\n/pakustad Apa hukumnya mencintai Nahida`);
    }

    const encodedText = encodeURIComponent(text);
    const endpoints = [
      `https://api.taka.my.id/tanya-ustad?quest=${encodedText}`,
      `https://api.taka.my.id/pak-ustadv2?text=${encodedText}`,
      `https://flowfalcon.dpdns.org/imagecreator/pustaz?text=${encodedText}`
    ];

    const randomUrl = endpoints[Math.floor(Math.random() * endpoints.length)];

    try {
      const res = await axios.head(randomUrl); // cek dulu HEAD-nya

      if (!res.headers['content-type']?.startsWith('image')) {
        throw new Error("Bukan gambar, endpoint gagal.");
      }

      await ctx.replyWithPhoto({ url: randomUrl });
    } catch (err) {
      console.error("PAK-USTAD ERROR:", err.message);
      return ctx.reply("⚠️ Gagal mengambil jawaban dari Pak Ustad. Coba lagi dengan teks berbeda.");
    }
  });
};