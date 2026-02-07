const { EmbedBuilder } = require("discord.js");
const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");
const { getLang } = require("../../utils/formatter");

module.exports = {
    name: "!envanter",
    aliases: ["!inv", "!canta", "!profile", "!e"],
    execute(client, msg, args) {
        const user = msg.mentions.users.first() || msg.author;
        const data = loadJson("data.json");
        
        ensureUser(data, user.id);
        saveJson("data.json", data);

        const p = data[user.id];
        const cuzdanInfo = getLang("cuzdan");
        const cantaInfo = getLang("canta");
        const envKasaInfo = getLang("envanterkasa");

        const kitList = Object.entries(p.kits).length > 0
            ? Object.entries(p.kits).map(([k, v]) => {
                const info = getLang(k);
                return `${info.emoji} **${info.name}** (x${v})`;
            }).join("\n")
            : "_Kit bulunmuyor._";

        const crateList = (p.crates && Object.entries(p.crates).length > 0)
            ? Object.entries(p.crates).map(([k, v]) => {
                const info = getLang(k);
                return `${info.emoji} **${info.name}** (x${v})`;
            }).join("\n")
            : "_Kasa bulunmuyor._";

        const walletList = ["pgmcoin", "ruby", "diamond"].map(c => {
            const info = getLang(c);
            return `${info.emoji} **${info.name}**: ${p[c]}`;
        }).join("\n");

        let descriptionContent = `## ${cuzdanInfo.emoji} ${cuzdanInfo.name}\n${walletList}\n`;
        descriptionContent += `## ${envKasaInfo.emoji} ${envKasaInfo.name}\n${crateList}\n`;
        descriptionContent += `## ${cantaInfo.emoji} ${cantaInfo.name}\n${kitList}`;

        const embed = new EmbedBuilder()
            .setColor(0x2B2D31)
            .setAuthor({ name: `${user.username} Envanteri`, iconURL: user.displayAvatarURL() })
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setDescription(descriptionContent)
            .setFooter({ text: "PGM BOT", iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        msg.channel.send({ embeds: [embed] });
    }
};