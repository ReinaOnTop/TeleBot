const axios = require('axios');

module.exports = (bot) => {
  bot.command("ai", async (ctx) => {
    try {
      const args = ctx.message.text.split(" ").slice(1);
      if (!args.length) {
        return ctx.reply("apa jir?", {
          parse_mode: "Markdown",
          reply_to_message_id: ctx.message.message_id
        });
      }

      const query = args.join(" ");

      const res = await axios.get("https://apiz.zteam.biz.id/api/ai/gpt", {
        params: { text: query },
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "sokepxyz"
        }
      });

      const answer = res.data?.message?.answer;
      if (!answer) {
        return ctx.reply("apa apaan dah", {
          reply_to_message_id: ctx.message.message_id
        });
      }

      const formatted = `${answer}\n\n**> Saturn Ai 🪐**`;
      return ctx.reply(formatted, {
        parse_mode: "Markdown",
        reply_to_message_id: ctx.message.message_id
      });
    } catch (err) {
      console.error("❌ Error in /ai:", err);
      return ctx.reply("Api down jir", {
        reply_to_message_id: ctx.message.message_id
      });
    }
  });
};