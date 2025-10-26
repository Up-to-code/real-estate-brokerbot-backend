"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResponseParser = createResponseParser;
const arabicTypeToEnum_1 = require("../utils/arabicTypeToEnum");
function parseJsonResponse(response) {
    try {
        return JSON.parse(response);
    }
    catch {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('No valid JSON found in response');
    }
}
function mapToProcessedResult(parsed) {
    switch (parsed.type) {
        case 'answer':
            return {
                type: 'answer',
                text: parsed.content
            };
        case 'search':
            if (!parsed.query) {
                throw new Error('Search response missing query field');
            }
            if (typeof parsed.query === 'object' && parsed.query !== null && 'type' in parsed.query && typeof parsed.query.type === 'string') {
                const queryObj = parsed.query;
                const arType = queryObj.type.trim();
                if (arabicTypeToEnum_1.arabicTypeToEnum[arType]) {
                    queryObj.type = arabicTypeToEnum_1.arabicTypeToEnum[arType];
                }
            }
            return {
                type: 'search',
                query: parsed.query
            };
        case 'event':
            if (!parsed.eventName || !parsed.eventDetails) {
                throw new Error('Event response missing required fields');
            }
            return {
                type: 'event',
                name: parsed.eventName,
                details: parsed.eventDetails
            };
        default:
            throw new Error(`Unknown response type: ${parsed.type}`);
    }
}
function createResponseParser() {
    return {
        parseResponse(response) {
            try {
                const parsed = parseJsonResponse(response);
                return mapToProcessedResult(parsed);
            }
            catch (error) {
                return {
                    type: 'answer',
                    text: 'I apologize, but I encountered an issue processing your request. Please try rephrasing your question.'
                };
            }
        }
    };
}
