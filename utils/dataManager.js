const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../data");

if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(DATA_PATH);
}

function getFilePath(filename) {
    return path.join(DATA_PATH, filename);
}

function loadJson(filename, fallback = {}) {
    const filePath = getFilePath(filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
        return fallback;
    }
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {
        return fallback;
    }
}

function saveJson(filename, data) {
    const filePath = getFilePath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function loadText(filename, fallback = "İçerik bulunamadı.") {
    const filePath = getFilePath(filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, fallback);
        return fallback;
    }
    return fs.readFileSync(filePath, "utf8");
}

/**
 * Kullanıcı verisini merkezi sisteme göre hazırlar.
 * items.json içindeki tüm 'currency' tipindeki birimleri otomatik olarak 0 bakiye ile ekler.
 */
function ensureUser(data, userId) {
    // items.json dosyasını yükle (Para birimlerini dinamik çekmek için)
    // Not: Döngüsel bağımlılığı önlemek için itemManager yerine doğrudan buradan yüklüyoruz.
    const itemsPath = getFilePath("items.json");
    let items = {};
    if (fs.existsSync(itemsPath)) {
        items = JSON.parse(fs.readFileSync(itemsPath, "utf8"));
    }

    if (!data[userId]) {
        data[userId] = {
            kits: {},
            crates: {}
        };
    }

    // items.json içindeki her bir currency (para birimi) için kontrol yap
    for (const [key, item] of Object.entries(items)) {
        if (item.type === "currency") {
            if (data[userId][key] === undefined) {
                data[userId][key] = 0;
            }
        }
    }

    // Temel objelerin varlığını garanti et
    if (!data[userId].kits) data[userId].kits = {};
    if (!data[userId].crates) data[userId].crates = {};

    return data;
}

module.exports = { loadJson, saveJson, loadText, ensureUser };