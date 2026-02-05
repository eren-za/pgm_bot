const { EmbedBuilder } = require("discord.js");
const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");

// Emojiler
const EMOJIS = {
    pgmcoin: "<:pgmcoin:1469015534493368442>",
    ruby: "<:ruby:1469015535911178280>",
    diamond: "<:diamond:1469015532836491274>",
    crystal: "<:crystal:1469015530760569058>",
    kit: "<:kit:1469016921478266880>",
    cuzdan: "<:cuzdan:1469017634950480097>",
    canta: "<:canta:1469018374930698240>"
};

module.exports = {
    name: "!envanter",
    aliases: ["!inv", "!canta", "!profile", "!e"],
    description: "Kullanıcının bakiyesini ve kitlerini devasa boyutlarda gösterir.",
    execute(client, msg, args) {
        const user = msg.mentions.users.first() || msg.author;
        const data = loadJson("data.json");
        
        ensureUser(data, user.id);
        saveJson("data.json", data);

        const p = data[user.id];

        const kitList = Object.entries(p.kits).length > 0
            ? Object.entries(p.kits)
                .map(([k, v]) => `## ${EMOJIS.kit} ${k} (x${v})`)
                .join("\n")
            : "### _Çantanız boş._";

        const walletList = [
            `### ${EMOJIS.pgmcoin} PGM Coin: ${p.pgmcoin}`,
            `### ${EMOJIS.ruby} Yakut: ${p.ruby}`,
            `### ${EMOJIS.diamond} Elmas: ${p.diamond}`,
            `### ${EMOJIS.crystal} Kristal: ${p.crystal}`
        ].join("\n");

        const descriptionContent = 
            `# ${EMOJIS.cuzdan} Cüzdan\n` + 
            `${walletList}\n\n` + 
            `# ${EMOJIS.canta} Kitler\n` + 
            `${kitList}`;

        const embed = new EmbedBuilder()
            .setColor(0x009cff)
            .setAuthor({ name: `${user.username} Envanteri`, iconURL: user.displayAvatarURL() })
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setDescription(descriptionContent) // Her şey burada
            .setFooter({ text: "PGM Economy", iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        msg.channel.send({ embeds: [embed] });
    }
};