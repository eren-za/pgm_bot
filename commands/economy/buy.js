const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");
const { getLang } = require("../../utils/formatter");

module.exports = {
    name: "!satinal",
    aliases: ["!buy", "!al"],
    execute(client, msg, args) {
        const check = getLang("check").emoji;
        const negative = getLang("negative").emoji;
        const itemName = args[0]?.toLowerCase();

        if (!itemName) return msg.reply(`${negative} **Hatalı Kullanım!**\nDoğrusu: \`!satinal <urun_adi>\``);

        const data = loadJson("data.json");
        const market = loadJson("market.json");
        
        ensureUser(data, msg.author.id);

        const item = market[itemName];
        if (!item) return msg.reply(`${negative} **${itemName}** adında bir ürün markette bulunamadı.`);

        const { currency, price, type } = item;
        const info = getLang(currency);
        const itemInfo = getLang(itemName);

        if (data[msg.author.id][currency] === undefined) {
            return msg.reply(`${negative} Sistemsel hata: Geçersiz para birimi.`);
        }

        if (data[msg.author.id][currency] < price) {
            return msg.reply(`${negative} **Yeterli bakiyen yok!** \nGereken: **${price} ${info.emoji} ${info.name}**`);
        }

        data[msg.author.id][currency] -= price;

        if (type === "kit") {
            if (!data[msg.author.id].kits) data[msg.author.id].kits = {};
            data[msg.author.id].kits[itemName] = (data[msg.author.id].kits[itemName] || 0) + 1;
            msg.reply(`${check} Başarıyla **${itemInfo.emoji} ${itemInfo.name}** kiti satın alındı!`);
        } else if (type === "crate") {
            if (!data[msg.author.id].crates) data[msg.author.id].crates = {};
            data[msg.author.id].crates[itemName] = (data[msg.author.id].crates[itemName] || 0) + 1;
            msg.reply(`${check} Başarıyla **${itemInfo.emoji} ${itemInfo.name}** satın alındı!`);
        } else {
            data[msg.author.id][currency] += price; 
            return msg.reply(`${negative} **HATA:** Ürün türü belirtilmemiş! Para iade edildi.`);
        }

        saveJson("data.json", data);
    }
};