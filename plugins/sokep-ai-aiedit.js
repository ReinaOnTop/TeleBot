const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = (bot) => {
  const genAI = new GoogleGenerativeAI("AIzaSyB8T-3WnKqDbK3GSYYUtTiyDfIV-vBxoPw");

  bot.command(["aiedit", "editai"], async (ctx) => {
    try {
      const replyMsg = ctx.message.reply_to_message;
      const prompt = ctx.message.text.split(" ").slice(1).join(" ");
      if (!replyMsg) return ctx.reply("Silakan reply gambar yang ingin diedit.");
      if (!prompt) return ctx.reply("Masukkan prompt custom.\nContoh: /aiedit buat lebih estetik");

      const file = replyMsg.photo?.pop(); // Ambil foto resolusi tertinggi
      if (!file) return ctx.reply("Media yang direply bukan gambar.");

      const fileLink = await ctx.telegram.getFileLink(file.file_id);
      const response = await axios.get(fileLink.href, { responseType: "arraybuffer" });

      const mime = "image/jpeg";
      const base64Image = Buffer.from(response.data).toString("base64");

      await ctx.reply("Memproses permintaan, tunggu sebentar...");

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp-image-generation",
        generationConfig: {
          responseModalities: ["Text", "Image"]
        }
      });

      const contents = [
        { text: prompt },
        {
          inlineData: {
            mimeType: mime,
            data: base64Image
          }
        }
      ];

      const result = await model.generateContent(contents);
      const parts = result?.response?.candidates?.[0]?.content?.parts;

      if (!parts) return ctx.reply("Respons dari AI tidak valid.");

      let resultImage;
      let resultText = "";

      for (const part of parts) {
        if (part.text) resultText += part.text;
        if (part.inlineData) resultImage = Buffer.from(part.inlineData.data, "base64");
      }

      if (!resultImage) return ctx.reply("Gagal menghasilkan gambar dari AI.");

      const tmpPath = path.join(process.cwd(), "tmp");
      if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath, { recursive: true });

      const outPath = path.join(tmpPath, `editai_${Date.now()}.png`);
      fs.writeFileSync(outPath, resultImage);

      await ctx.replyWithPhoto({ source: outPath }, {
        caption: "Edit selesai sesuai permintaan."
      });

      setTimeout(() => {
        try {
          fs.unlinkSync(outPath);
        } catch (e) {
          console.error("Gagal hapus file sementara:", e);
        }
      }, 30000);

    } catch (err) {
      console.error("AIEdit Error:", err);
      ctx.reply(`Terjadi kesalahan: ${err.message}`);
    }
  });
};