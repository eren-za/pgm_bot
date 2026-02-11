const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");
const { getLang } = require("../../utils/formatter");
const { getItemInfo, isValidItem } = require("../../utils/itemManager");

module.exports = {
    name: "!satınal",
    aliases: ["!buy", "!satinal"],
    execute(client, msg, args) {
        const check = getLang("check").emoji;
        const negative = getLang("negative").emoji;
        const itemName = args[0]?.toLowerCase();

        if (!itemName) return msg.reply(`${negative} **Hatalı Kullanım!**\nDoğrusu: \`!satinal <urun_adi>\``);

        const market = loadJson("market.json");
        const itemMarketData = market[itemName];

        // 1. Market Dosyası Kontrolü
        if (!itemMarketData) {
            return msg.reply(`${negative} **${itemName}** adında bir ürün markette bulunamadı.`);
        }

        // 2. Merkezi Sistem (items.json) Kontrolü
        if (!isValidItem(itemName)) {
            return msg.reply(`${negative} Sistemsel hata: **${itemName}** eşya listesinde tanımlı değil.`);
        }

        const data = loadJson("data.json");
        ensureUser(data, msg.author.id);

        const { currency, price, type } = itemMarketData;
        
        // Eşya ve Para Birimi Bilgilerini Al (Emoji ve isim için)
        const itemInfo = getItemInfo(itemName);
        const currencyInfo = getItemInfo(currency);

        if (!currencyInfo) {
            return msg.reply(`${negative} Sistemsel hata: Geçersiz para birimi (**${currency}**).`);
        }

        const p = data[msg.author.id];

        // 3. Bakiye Kontrolü
        if (p[currency] === undefined || p[currency] < price) {
            return msg.reply(`${negative} **Yeterli bakiyen yok!** \nGereken: **${price} ${currencyInfo.emoji} ${currencyInfo.name}**`);
        }

        // 4. Ödeme ve Teslimat
        p[currency] -= price;

        if (type === "kit") {
            if (!p.kits) p.kits = {};
            p.kits[itemName] = (p.kits[itemName] || 0) + 1;
        } 
        else if (type === "crate") {
            if (!p.crates) p.crates = {};
            p.crates[itemName] = (p.crates[itemName] || 0) + 1;
        } 
        else {
            // Güvenlik: Para iadesi
            p[currency] += price;
            return msg.reply(`${negative} **HATA:** Ürün türü (` + type + `) hatalı! Para iade edildi.`);
        }

        saveJson("data.json", data);

        msg.reply(`${check} Başarıyla **${price} ${currencyInfo.name}** karşılığında **${itemInfo.emoji} ${itemInfo.name}** satın alındı!`);
    }
};