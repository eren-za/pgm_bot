const { loadJson } = require("./dataManager");

function getLang(key) {
    // lang.json dosyasýný yükle
    const lang = loadJson("lang.json");
    
    // Küçük harfe çevirerek güvenli arama yap
    const lowerKey = key.toLowerCase();
    const item = lang[lowerKey];
    
    // Eðer lang.json içinde bu anahtar yoksa, en azýndan ismi geri döndür
    if (!item) return { name: key, emoji: "", full: key };

    return {
        name: item.name || key,
        emoji: item.emoji || "",
        // "full" özelliði komutlarda iþini çok kolaylaþtýrýr (Örn: msg.reply(`Hata! ${getLang("negative").full}`))
        full: `${item.emoji || ""} ${item.name || key}`.trim()
    };
}

module.exports = { getLang };