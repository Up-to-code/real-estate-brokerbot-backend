"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSearch = handleSearch;
const searchProperties_1 = require("../../services/searchProperties");
const historyUtils_1 = require("./historyUtils");
async function handleSearch(query, clientId) {
    const properties = await (0, searchProperties_1.searchProperties)(query);
    if (clientId)
        await (0, historyUtils_1.saveSearchHistory)(clientId, query, properties);
    return properties;
}
