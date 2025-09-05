const FormData = require('form-data');
const fetch = require('node-fetch');

module.exports = async function upload(buffer) {
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', buffer, 'file.webp');

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form,
  });

  const url = await res.text();

  if (!url.includes('https://')) {
    throw new Error('Gagal mengupload ke Catbox');
  }

  return url.trim();
};