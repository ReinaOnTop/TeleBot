const fs = require("fs");
const path = require("path");
const acorn = require("acorn");

module.exports = (bot) => {
  bot.command("syntax", async (ctx) => {
    const targetPaths = [
      "./saturn.js",
      "./lib",
      "./plugins"
    ];

    const allFiles = [];
    targetPaths.forEach(p => {
      const fullPath = path.resolve(p);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          getAllJsFiles(fullPath, allFiles);
        } else if (p.endsWith(".js")) {
          allFiles.push(fullPath);
        }
      }
    });

    let validCount = 0;
    let errorCount = 0;
    const errorReports = [];

    for (const file of allFiles) {
      const code = fs.readFileSync(file, "utf-8");
      const relativePath = path.relative(process.cwd(), file);

      try {
        acorn.parse(code, {
          ecmaVersion: 2020,
          sourceType: "module",
          allowHashBang: true,
        });

        try {
          require(file);
          validCount++;
        } catch (e) {
          errorCount++;
          const msg = (e.message || "Unknown error").split("\n")[0];
          errorReports.push(
            `📄 *File:* \`${relativePath}\`\n` +
            `🚫 *Require Error*\n` +
            `💬 *Pesan:* ${msg}\n`
          );
        }
      } catch (e) {
        errorCount++;
        const loc = e.loc || { line: "?", column: "?" };
        const errorLine = code.split("\n")[loc.line - 1]?.trim() || "(cuplikan tidak tersedia)";
        errorReports.push(
          `📄 *File:* \`${relativePath}\`\n` +
          `🚫 *Syntax Error*\n` +
          `📑 *Baris:* ${loc.line}, Kolom: ${loc.column}\n` +
          `💬 *Pesan:* ${e.message}\n` +
          `🔎 *Cuplikan:*\n\`\`\`js\n${errorLine}\n\`\`\`\n`
        );
      }
    }

    const summary = `🧪 *HASIL CEK SYNTAX TOTAL*\n` +
                    `📁 Folder: \`lib\`, \`plugins\`, dan file \`saturn.js\`\n` +
                    `📄 Total File: ${allFiles.length}\n` +
                    `✅ Valid: ${validCount}\n` +
                    `❌ Error: ${errorCount}\n\n`;

    const result = summary + (errorReports.length ? errorReports.join("\n") : `🎉 Semua file aman dari syntax & require error!`);

    return ctx.reply(result.slice(0, 4096), { parse_mode: "Markdown" });
  });
};

function getAllJsFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllJsFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith(".js")) {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
}