"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
function getUrlChecksum(url, algorithm = "sha256") {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default({
            method: "GET",
            url,
            responseType: "stream",
        });
        return new Promise((resolve, reject) => {
            const hash = crypto_1.createHash(algorithm);
            response.data.on("data", (chunk) => {
                hash.update(chunk);
            });
            response.data.on("end", () => {
                resolve(hash.digest("hex"));
            });
            response.data.on("error", reject);
        });
    });
}
exports.getUrlChecksum = getUrlChecksum;
