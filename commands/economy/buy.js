const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");

module.exports = {
    name: "!satinal",
    aliases: ["!buy"],
    description: "Marketten eşya satın alır.",
    execute(client, msg, args) {
        const kitName = args[0]?.toLowerCase();
        if (!kitName) return msg.reply("Kullanım: `!satinal <kit>`");

        const data = loadJson("data.json");
        const market = loadJson("market.json");
        ensureUser(data, msg.author.id);

        const item = market[kitName];
        if (!item) return msg.reply("❌ Böyle bir kit markette yok.");

        const { currency, price } = item;
        if (data[msg.author.id][currency] < price) return msg.reply("❌ Yeterli bakiyen yok.");

        data[msg.author.id][currency] -= price;
        data[msg.author.id].kits[kitName] = (data[msg.author.id].kits[kitName] || 0) + 1;

        saveJson("data.json", data);
        msg.reply(`✅ **${kitName}** kiti satın alındı.`);
    }
};