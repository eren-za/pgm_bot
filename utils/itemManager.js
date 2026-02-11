const { loadJson } = require("./dataManager");

// Tüm eþyalarý getir
function getAllItems() {
    return loadJson("items.json", "data"); // data/items.json okur
}

// Belirli bir eþyanýn bilgisini al (isim, emoji vb.)
function getItemInfo(key) {
    const items = getAllItems();
    return items[key] || null;
}

// Bir þeyin geçerli olup olmadýðýný kontrol et
function isValidItem(key) {
    const items = getAllItems();
    return !!items[key];
}

// Sadece belirli türdeki eþyalarý getir (Örn: sadece 'currency' olanlar)
function getItemsByType(type) {
    const items = getAllItems();
    const filtered = {};
    for (const [key, val] of Object.entries(items)) {
        if (val.type === type) filtered[key] = val;
    }
    return filtered;
}

// Transfer edilebilir mi kontrol et
function isTradeable(key) {
    const item = getItemInfo(key);
    return item && item.tradeable;
}

module.exports = { 
    getAllItems, 
    getItemInfo, 
    isValidItem, 
    getItemsByType,
    isTradeable
};