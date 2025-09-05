// ✅ lib/ular_tangga.js
const fs = require('fs');
const Jimp = require('jimp');

async function drawBoard(boardImageURL, user1 = null, user2 = null, user3 = null, user4 = null, stabil_x, stabil_y) {
    try {
        const board = await Jimp.read(boardImageURL);
        const playerPositions = [user1, user2, user3, user4].filter(pos => pos && pos >= 1 && pos <= 100);

        const playerImageURLs = [
            "https://telegra.ph/file/30f92f923fb0484f0e4e0.png", // merah
            "https://telegra.ph/file/6e07b5f30b24baedc7822.png", // kuning
            "https://telegra.ph/file/34f47137df0dc9aa9c15a.png", // hijau
            "https://telegra.ph/file/860b5df98963a1f14a91c.png"  // biru
        ];

        for (let i = 0; i < playerPositions.length; i++) {
            const pos = playerPositions[i];
            const row = Math.floor((pos - 1) / 10);
            const col = (row % 2 === 0) ? (pos - 1) % 10 : 9 - ((pos - 1) % 10);
            const x = col * 60 + stabil_x;
            const y = (9 - row) * 60 + stabil_y;

            const img = await Jimp.read(playerImageURLs[i]);
            img.resize(50, 50);
            board.composite(img, x - 4, y - 4, { mode: Jimp.BLEND_SOURCE_OVER });
        }

        return await board.getBufferAsync(Jimp.MIME_PNG);
    } catch (err) {
        console.error("⚠️ drawBoard error:", err);
        return null;
    }
}

module.exports = { drawBoard };