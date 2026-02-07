const { loadJson } = require("./dataManager");

function getLang(key) {
    const lang = loadJson("lang.json");
    const item = lang[key.toLowerCase()];
    
    if (!item) return { name: key, emoji: "" };
    return {
        name: item.name || key,
        emoji: item.emoji || "",
        full: `${item.emoji || ""} ${item.name || key}`.trim()
    };
}

module.exports = { getLang };