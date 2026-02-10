const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "!sorgu",
    aliases: ["!check"],
    description: "Kullanıcının PGM Premium durumu kontrol edilir.",
    execute: async (client, msg, args) => {
        const user = msg.mentions.users.first() || msg.author;

        const isPremium = client.pgmPremiumUsers?.includes(user.id) || false;

        let embed;

        if (isPremium) {
            embed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle("🎉 Premium Durumu")
                .setDescription(`Tebrikler ${user.username}! Sen PGM Premium üyesisin. 🌟`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: "Premium ayrıcalıklarının tadını çıkar!" })
                .setTimestamp();
        } else {
            embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle("❌ Premium Durumu")
                .setDescription(`Maalesef ${user.username}, senin PGM Premium'un yok. 😏\nHemen şimdi Premium'lu ol! **!premium**`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: "Ayrıcalıkları kaçırma!" })
                .setTimestamp();
        }

        msg.channel.send({ embeds: [embed] });
    },
};