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

function ensureUser(data, userId) {
    if (!data[userId]) {
        data[userId] = {
            pgmcoin: 0,
            ruby: 0,
            diamond: 0,
            crystal: 0,
            kits: {},
            crates: {} // Yeni Kasa Kategorisi
        };
    } else {
        // Eski verileri tamamlama (Migration)
        if (data[userId].pgmcoin === undefined) data[userId].pgmcoin = 0;
        if (data[userId].ruby === undefined) data[userId].ruby = 0;
        if (data[userId].diamond === undefined) data[userId].diamond = 0;
        if (data[userId].crystal === undefined) data[userId].crystal = 0;
        if (!data[userId].kits) data[userId].kits = {};
        if (!data[userId].crates) data[userId].crates = {}; // Kasalar yoksa ekle
    }
    return data;
}

module.exports = { loadJson, saveJson, loadText, ensureUser };