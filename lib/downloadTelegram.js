const fs = require("fs");
const path = require("path");
const axios = require("axios");

async function downloadTelegramFile(telegram, fileId, saveDir = "./tmp") {
  try {
    // Ambil URL file dari Telegram
    const link = await telegram.getFileLink(fileId);

    // Download isi file dalam bentuk buffer
    const res = await axios.get(link.href, { responseType: "arraybuffer" });

    // Pastikan folder tujuan tersedia
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir);

    // Ekstensi dari URL Telegram
    const ext = path.extname(link.pathname) || ".dat";

    // Buat nama file berdasarkan timestamp
    const filename = `${Date.now()}${ext}`;
    const fullPath = path.join(saveDir, filename);

    // Tulis file ke disk
    fs.writeFileSync(fullPath, res.data);

    return fullPath;
  } catch (err) {
    throw new Error("Gagal mendownload file dari Telegram: " + err.message);
  }
}

module.exports = downloadTelegramFile;