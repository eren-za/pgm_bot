const { loadJson, saveJson, ensureUser } = require("../../utils/dataManager");

module.exports = {
    name: "!satinal",
    aliases: ["!buy", "!al", "!market"],
    description: "Belirlenen türüne göre marketten eşya satın alır.",
    execute(client, msg, args) {
        // 1. Ürün adı girildi mi?
        const itemName = args[0]?.toLowerCase();
        if (!itemName) return msg.reply("Kullanım: `!satinal <urun_adi>`");

        const data = loadJson("data.json");
        const market = loadJson("market.json");
        
        ensureUser(data, msg.author.id);

        // 2. Ürün markette var mı?
        const item = market[itemName];
        if (!item) return msg.reply(`❌ **${itemName}** adında bir ürün markette bulunamadı.`);

        // 3. Verileri Çek (Fiyat, Para Birimi ve TÜR)
        const { currency, price, type } = item;

        // Para birimi kontrolü (Hata ayıklama için)
        if (data[msg.author.id][currency] === undefined) {
            return msg.reply(`❌ Sistemsel hata: Market dosyasındaki '${currency}' para birimi geçersiz.`);
        }

        // 4. Bakiye Yeterli mi?
        if (data[msg.author.id][currency] < price) {
            return msg.reply(`❌ Yeterli bakiyen yok! \nGereken: **${price} ${currency}** \nSenin Bakiyen: **${data[msg.author.id][currency]}**`);
        }

        // --- SATIN ALMA İŞLEMİ ---
        
        // Önce parayı düşüyoruz
        data[msg.author.id][currency] -= price;

        // 5. TÜR KONTROLÜ VE ENVANTERE EKLEME
        // İleride buraya "pet", "arac" vb. eklenebilir.
        
        if (type === "kit") {
            // Kit Bölümü
            if (!data[msg.author.id].kits) data[msg.author.id].kits = {};
            data[msg.author.id].kits[itemName] = (data[msg.author.id].kits[itemName] || 0) + 1;
            
            msg.reply(`✅ Başarıyla **${itemName}** kiti satın alındı!`);
        
        } else if (type === "crate") {
            // Kasa Bölümü
            if (!data[msg.author.id].crates) data[msg.author.id].crates = {};
            data[msg.author.id].crates[itemName] = (data[msg.author.id].crates[itemName] || 0) + 1;
            
            msg.reply(`✅ Başarıyla **${itemName}** kasası satın alındı!`);
        
        } else {
            // Tanımsız Tür Hatası (Güvenlik)
            // Eğer market.json'a type eklemeyi unuttuysan paran yanmasın diye iade edelim.
            data[msg.author.id][currency] += price; 
            return msg.reply(`⚠️ HATA: **${itemName}** ürününün türü (type) market dosyasında belirtilmemiş! Para iade edildi.`);
        }

        saveJson("data.json", data);
    }
};