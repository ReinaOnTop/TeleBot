const axios = require("axios");
const FormData = require("form-data");

async function uploadImage(buffer) {
  try {
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", buffer, { filename: "image.jpg" });

    const res = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders()
    });

    if (!res.data || !res.data.startsWith("https://")) throw new Error("Respon tidak valid dari Catbox");

    return res.data;
  } catch (err) {
    console.error("❌ Gagal upload ke Catbox:", err.message);
    return null;
  }
}

module.exports = uploadImage;