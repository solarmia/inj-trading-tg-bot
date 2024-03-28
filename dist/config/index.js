"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.injExplorer = exports.dojoPairUrl = exports.injAddr = exports.orderPath = exports.rankPath = exports.settingsPath = exports.userPath = exports.treasury = exports.dexUrl = exports.feeAccountSecret = exports.feeAccountAddr = exports.fee = exports.RpcURL = exports.BotToken = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.BotToken = process.env.TOKEN;
exports.RpcURL = process.env.RPC_URL;
exports.fee = Number(process.env.FEE_RATE);
exports.feeAccountAddr = process.env.FEE_ACCOUNT_PUBKEY;
exports.feeAccountSecret = process.env.FEE_ACCOUNT_PRIVKEY;
exports.dexUrl = process.env.DEX_URL;
exports.treasury = process.env.TREASURY;
exports.userPath = './user.json';
exports.settingsPath = './settings.json';
exports.rankPath = './rank.json';
exports.orderPath = './order.json';
exports.injAddr = 'inj';
exports.dojoPairUrl = 'https://dojo.trading/pairs';
exports.injExplorer = 'https://explorer.injective.network';
//# sourceMappingURL=index.js.map