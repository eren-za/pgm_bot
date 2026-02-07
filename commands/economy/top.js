const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "!top",
    description: "PGM Coin liderlik tablosunu gösterir.",
    execute(client, msg, args) {
        // Data.json dosyasını oku
        const dataPath = path.join(__dirname, "../../data/data.json");
        const rawData = fs.readFileSync(dataPath, "utf8");
        const usersData = JSON.parse(rawData);

        // Kullanıcıları pgmcoin'e göre sırala
        const sortedUsers = Object.entries(usersData)
            .sort((a, b) => b[1].pgmcoin - a[1].pgmcoin)
            .slice(0, 10); // İlk 10 kullanıcı

        // Liderlik tablosu içeriğini oluştur
        let leaderboard = "";
        sortedUsers.forEach(([userId, userData], index) => {
            leaderboard += `**${index + 1}.** <@${userId}> — <:pgmcoin:1469015534493368442> ${userData.pgmcoin}\n`;
        });

        // Embed oluştur
        const embed = new EmbedBuilder()
            .setTitle("🏆 PGM Coin Liderlik Tablosu")
            .setDescription(leaderboard || "Henüz veri yok.")
            .setColor("#FFD700")
            .setTimestamp();

        msg.channel.send({ embeds: [embed] });
    },
};
