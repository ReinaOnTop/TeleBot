const fetch = require("node-fetch");
const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = (bot) => {
  bot.command(["pin", "pinterest"], async (ctx) => {
    try {
      const text = ctx.message.text || "";
      const args = text.split(" ").slice(1).join(" ");
      if (!args) return ctx.reply("Masukkan query!\nContoh: /pin mikasa");

      let [search, jumlahRaw] = args.split("|");
      let jumlah = parseInt(jumlahRaw) || 10;
      if (jumlah > 20) jumlah = 20;

      const apikey = "DitssGanteng";
      const apiUrl = `https://api.ditss.cloud/search/pinterest?apikey=${apikey}&q=${encodeURIComponent(search)}`;

      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Gagal mengambil data dari API");

      const json = await res.json();
      if (!json.status || !json.result?.length) {
        return ctx.reply("Gambar tidak ditemukan.");
      }

      let shuffled = json.result.sort(() => Math.random() - 0.5).slice(0, jumlah);
      let estimasi = jumlah * 2;

      await ctx.reply(
  `Menampilkan ${jumlah} hasil untuk: ${search.trim()}\nEstimasi waktu kirim: ${estimasi} detik`
);

      for (let i = 0; i < shuffled.length; i++) {
        const data = shuffled[i];
        const caption =
`Pinterest #${i + 1}

Query: ${search.trim()}
Judul: ${data.title || "-"}
Tanggal: ${data.created_at || "-"}
Pin: ${data.pin_url}`;

        await ctx.replyWithPhoto(data.image, { caption });
        await delay(2000);
      }

      await ctx.reply(`Selesai mengirim ${jumlah} gambar.`);
    } catch (e) {
      console.error("Pinterest Error:", e);
      ctx.reply("Terjadi kesalahan saat menghubungi API Pinterest.");
    }
  });
};