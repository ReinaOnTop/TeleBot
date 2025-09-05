const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpegPath = ffmpegInstaller.path;

function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  return new Promise(async (resolve, reject) => {
    try {
      const tmp = path.join(__dirname, '../tmp', +new Date + '.' + ext);
      const out = tmp + '.' + ext2;
      await fs.promises.writeFile(tmp, buffer);

      spawn(ffmpegPath, ['-y', '-i', tmp, ...args, out])
        .on('error', reject)
        .on('close', async (code) => {
          try {
            await fs.promises.unlink(tmp);
            if (code !== 0) return reject(code);
            resolve({
              data: await fs.promises.readFile(out),
              filename: out
            });
            // await fs.promises.unlink(out); // kalau mau hapus otomatis
          } catch (e) {
            reject(e);
          }
        });
    } catch (e) {
      reject(e);
    }
  });
}

function toPTT(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-vbr', 'on',
  ], ext, 'ogg');
}

function toAudio(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-vbr', 'on',
    '-compression_level', '10'
  ], ext, 'opus');
}

function toVideo(buffer, ext) {
  return ffmpeg(buffer, [
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-ab', '128k',
    '-ar', '44100',
    '-crf', '32',
    '-preset', 'slow'
  ], ext, 'mp4');
}

function toMp3(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-ar', '44100',
    '-ac', '2',
    '-b:a', '192k'
  ], ext, 'mp3');
}

module.exports = {
  toAudio,
  toPTT,
  toVideo,
  toMp3,
  ffmpeg,
};