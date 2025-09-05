const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

async function uploadToCatbox(filePath) {
  try {
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(filePath));

    const res = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders()
    });

    return res.data;
  } catch (err) {
    throw new Error("Gagal upload ke Catbox: " + err.message);
  }
}

module.exports = { uploadToCatbox };
