"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProperty = exports.deleteProperty = exports.getPropertyById = exports.createProperty = exports.getProperties = void 0;
const getProperties_1 = __importDefault(require("./getProperties"));
exports.getProperties = getProperties_1.default;
const createProperty_1 = __importDefault(require("./createProperty"));
exports.createProperty = createProperty_1.default;
const getPropertyById_1 = __importDefault(require("./getPropertyById"));
exports.getPropertyById = getPropertyById_1.default;
const deleteProperty_1 = __importDefault(require("./deleteProperty"));
exports.deleteProperty = deleteProperty_1.default;
const updateProperty_1 = __importDefault(require("./updateProperty"));
exports.updateProperty = updateProperty_1.default;
