"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPrivkey = exports.isValidAddress = exports.checkPossibleOrder = exports.placeLimitOrder = exports.addPlaceOrder = exports.getAllTokenList = exports.getTopTradersHelper = exports.swapTokenHelper = exports.getTokenInfoHelper = exports.setSettings = exports.getSetting = exports.checkValidAddr = exports.importWalletHelper = exports.createWalletHelper = exports.fetch = exports.validReferalLink = exports.checkInfo = exports.init = exports.deleteSync = exports.sendSyncTitle = exports.sendSyncMsg = void 0;
const bip39_1 = require("bip39");
const sdk_ts_1 = require("@injectivelabs/sdk-ts");
const networks_1 = require("@injectivelabs/networks");
const js_base64_1 = require("js-base64");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const type_1 = require("../utils/type");
const utils_1 = require("../utils");
let userData = {};
let settings = {};
let rankData = {};
let orderData = {};
const endpoints = (0, networks_1.getNetworkEndpoints)(networks_1.Network.Mainnet);
const indexerGrpcAccountPortfolioApi = new sdk_ts_1.IndexerGrpcAccountPortfolioApi(endpoints.indexer);
const chainGrpcBankApi = new sdk_ts_1.ChainGrpcBankApi(endpoints.grpc);
const indexerRestExplorerApi = new sdk_ts_1.IndexerRestExplorerApi(`${endpoints.explorer}/api/explorer/v1`);
const sendSyncMsg = async (bot, chatId, result) => {
    await bot.sendMessage(chatId, result.title, {
        reply_markup: {
            inline_keyboard: result.content,
            resize_keyboard: true
        }, parse_mode: 'HTML'
    })
        .then(msg => msg)
        .catch((error) => {
        if (error.response && error.response.statusCode === 429) {
            setTimeout(async () => {
                await (0, exports.sendSyncMsg)(bot, chatId, result);
            }, 1000);
        }
        if (error.response && error.response.statusCode === 403) {
            return;
        }
    });
};
exports.sendSyncMsg = sendSyncMsg;
// export const sendSyncTitle = async (bot: TelegramBot, chatId: number, title: any)=> {
//   await bot.sendMessage(
//     chatId,
//     title
//   )
//     .then(msg => {
//       console.log('----',msg)
//       return msg
//     })
//     .catch((error: TelegramErrorResponse) => {
//       if (error.response && error.response.statusCode === 429) {
//         setTimeout(async () => {
//           return await sendSyncMsg(bot, chatId, title);
//         }, 1000);
//       }
//     })
// }
const sendSyncTitle = async (bot, chatId, title) => {
    while (true) {
        try {
            const msg = await bot.sendMessage(chatId, title);
            return msg;
        }
        catch (error) {
            setTimeout(async () => {
            }, 1000);
        }
    }
};
exports.sendSyncTitle = sendSyncTitle;
const deleteSync = async (bot, chatId, msgId) => {
    await bot.deleteMessage(chatId, msgId)
        .catch((error) => { });
};
exports.deleteSync = deleteSync;
const init = async () => {
    userData = await (0, utils_1.readData)(config_1.userPath);
    rankData = await (0, utils_1.readData)(config_1.rankPath);
    orderData = await (0, utils_1.readData)(config_1.orderPath);
    settings = await (0, utils_1.readData)(config_1.settingsPath);
};
exports.init = init;
const checkInfo = async (chatId) => {
    if (!(chatId.toString() in settings)) {
        settings[chatId] = type_1.initialSetting;
        const result = await (0, utils_1.writeData)(settings, config_1.settingsPath);
        if (result)
            return false;
    }
    if (chatId.toString() in userData && userData[chatId].privateKey)
        return true;
    else
        false;
};
exports.checkInfo = checkInfo;
const validReferalLink = async (link, botName, chatId) => {
    const validation = `https://t.me/${botName}?ref=`;
    if (link.startsWith(validation)) {
        const encoded = link.replace(validation, '');
        const decoded = (0, js_base64_1.decode)(encoded);
        if (chatId.toString() == decoded)
            return false;
        userData[decoded].referees.push(chatId.toString());
        const referralLink = `https://t.me/${botName}?ref=${(0, js_base64_1.encode)(chatId.toString())}`;
        userData[chatId] = {
            privateKey: "",
            publicKey: "",
            balance: 0,
            referralLink,
            referees: [],
            referrer: decoded,
            buy: 0,
            sell: 0,
            sclx: 0
        };
        const result = await (0, utils_1.writeData)(userData, config_1.userPath);
        if (result)
            return false;
        return true;
    }
    else {
        return false;
    }
};
exports.validReferalLink = validReferalLink;
const getINJBalance = async (adderss) => {
    const portfolio = await indexerGrpcAccountPortfolioApi.fetchAccountPortfolioBalances(adderss);
    for (let i = 0; i < portfolio.bankBalancesList.length; i++) {
        if (portfolio.bankBalancesList[i].denom == 'inj') {
            return Number(portfolio.bankBalancesList[i].amount) / 1e18;
        }
    }
    return 0;
};
const fetch = async (chatId, botName) => {
    try {
        if (userData[chatId] && userData[chatId].publicKey) {
            userData[chatId].sclx = (userData[chatId].buy + userData[chatId].sell) / Math.pow(10, 18) * 5;
            const balance = await getINJBalance(userData[chatId].publicKey);
            userData[chatId].balance = balance;
            const result = await (0, utils_1.writeData)(userData, config_1.userPath);
            if (result)
                return false;
            return {
                publicKey: userData[chatId].publicKey,
                privateKey: userData[chatId].privateKey,
                referralLink: userData[chatId].referralLink,
                balance,
                referees: userData[chatId].referees,
                referrer: userData[chatId].referrer,
                sclx: userData[chatId].sclx,
            };
        }
        else
            return undefined;
    }
    catch (e) {
        return {
            publicKey: userData[chatId].publicKey,
            privateKey: userData[chatId].privateKey,
            referralLink: userData[chatId].referralLink,
            balance: 0,
            referees: userData[chatId].referees,
            referrer: userData[chatId].referrer,
            sclx: userData[chatId].sclx,
        };
    }
};
exports.fetch = fetch;
const createWalletHelper = async (chatId, botName) => {
    const mnemonic = (0, bip39_1.generateMnemonic)();
    const privateKey = sdk_ts_1.PrivateKey.fromMnemonic(mnemonic);
    const publicKey = privateKey.toAddress().toBech32();
    const referralLink = `https://t.me/${botName}?ref=${(0, js_base64_1.encode)(chatId.toString())}`;
    userData[chatId] = {
        privateKey: privateKey.toPrivateKeyHex(),
        publicKey,
        balance: 0,
        referralLink,
        referees: [],
        referrer: '',
        buy: 0,
        sell: 0,
        sclx: 0
    };
    const result = await (0, utils_1.writeData)(userData, config_1.userPath);
    if (result)
        return false;
    return {
        publicKey,
        balance: 0
    };
};
exports.createWalletHelper = createWalletHelper;
const importWalletHelper = async (chatId, privateKeyHex, botName) => {
    try {
        const privateKey = sdk_ts_1.PrivateKey.fromHex(privateKeyHex);
        const publicKey = privateKey.toAddress().toBech32();
        const referralLink = `https://t.me/${botName}?ref=${(0, js_base64_1.encode)(chatId.toString())}`;
        try {
            const balance = await getINJBalance(publicKey);
            userData[chatId] = {
                privateKey: privateKey.toPrivateKeyHex(),
                publicKey,
                balance,
                referralLink,
                referees: [],
                referrer: '',
                buy: 0,
                sell: 0,
                sclx: 0
            };
            (0, utils_1.writeData)(userData, config_1.userPath);
            return {
                publicKey,
                privateKey,
                referralLink,
                balance
            };
        }
        catch (e) {
            userData[chatId] = {
                privateKey: privateKey.toPrivateKeyHex(),
                publicKey: publicKey.toString(),
                balance: 0,
                referralLink,
                referees: [],
                referrer: '',
                buy: 0,
                sell: 0,
                sclx: 0
            };
            (0, utils_1.writeData)(userData, config_1.userPath);
            return {
                publicKey,
                privateKey,
                referralLink,
                balance: 0
            };
        }
    }
    catch (e) {
        return undefined;
    }
};
exports.importWalletHelper = importWalletHelper;
const checkValidAddr = async (addr) => {
    try {
        const info = await (0, utils_1.tokenInfo)(addr);
        if (!info)
            return;
        const dc = await (0, utils_1.getTokenDecimal)(addr);
        let currentToken;
        if (info.baseToken.address == addr)
            currentToken = Object.assign(Object.assign({}, info.baseToken), { decimals: dc });
        else
            currentToken = Object.assign(Object.assign({}, info.quoteToken), { decimals: dc });
        return {
            symbol: currentToken.symbol, name: currentToken.name, decimals: currentToken.decimals, SOLprice: info.priceNative, USDprice: info.priceUsd, volume: info.volume,
            priceX: info.priceChange, mcap: info.liquidity.usd
        };
    }
    catch (e) {
        console.log(e);
        throw new Error('');
    }
};
exports.checkValidAddr = checkValidAddr;
const getSetting = async (chatId) => {
    settings = await (0, utils_1.readData)(config_1.settingsPath);
    if (!(chatId in settings)) {
        settings[chatId] = type_1.initialSetting;
        (0, utils_1.writeData)(settings, config_1.settingsPath);
    }
    return settings[chatId];
};
exports.getSetting = getSetting;
const setSettings = async (chatId, category, value) => {
    if (category == 'announcement')
        settings[chatId]['announcement'] = !settings[chatId]['announcement'];
    else if (category == 'priority') {
        switch (settings[chatId].priority) {
            case 'Custom':
                settings[chatId].priority = 'Medium';
                settings[chatId].priorityAmount = 0.0001;
                break;
            case 'Medium':
                settings[chatId].priority = 'High';
                settings[chatId].priorityAmount = 0.0005;
                break;
            case 'High':
                settings[chatId].priority = 'Very High';
                settings[chatId].priorityAmount = 0.001;
                break;
            case 'Very High':
                settings[chatId].priority = 'Medium';
                settings[chatId].priorityAmount = 0.0001;
                break;
        }
    }
    else {
        //@ts-ignore
        settings[chatId][category] = value;
        if (category == 'priorityAmount')
            settings[chatId]['priority'] = 'Custom';
    }
    (0, utils_1.writeData)(settings, config_1.settingsPath);
    return settings[chatId];
};
exports.setSettings = setSettings;
const getTokenInfoHelper = async (addr, chatId) => {
    const address = addr.replace(/\//g, '-');
    const dex = (await axios_1.default.get(`${config_1.dexUrl}/${address}`)).data;
    if (!('pairs' in dex))
        return undefined;
    const pairs = dex.pairs;
    const middleToken = [];
    if (pairs && pairs.length) {
        for (let i = 0; i < pairs.length; i++) {
            if (pairs[i].chainId == 'injective' && pairs[i].dexId == 'dojoswap' && ((pairs[i].baseToken.address == config_1.injAddr && pairs[i].quoteToken.address == address) || (pairs[i].quoteToken.address == config_1.injAddr && pairs[i].baseToken.address == address))) {
                middleToken.push(pairs[i].baseToken.address == address ? pairs[i].quoteToken.address : pairs[i].baseToken.address);
                const tokenInfo = pairs[i].baseToken.address == address ? pairs[i].baseToken : pairs[i].quoteToken;
                const price = pairs[i].priceUsd;
                const priceChange = pairs[i].priceChange;
                const fdv = pairs[i].fdv;
                const pairAddress = pairs[i].pairAddress;
                const data = await (0, exports.fetch)(chatId);
                const balance = (data && (data === null || data === void 0 ? void 0 : data.balance)) ? data === null || data === void 0 ? void 0 : data.balance : 0;
                return { tokenInfo, price, priceChange, fdv, pairAddress, balance };
            }
        }
        return undefined;
    }
    else
        return undefined;
};
exports.getTokenInfoHelper = getTokenInfoHelper;
const swapTokenHelper = async (chatId, value, tokenAddr, type) => {
    settings = await (0, utils_1.readData)(config_1.settingsPath);
    userData = await (0, utils_1.readData)(config_1.userPath);
    const setInfo = settings[chatId];
    const userInfo = userData[chatId];
    let amount;
    const platformFeeBps = config_1.fee;
    const privateKeyHash = userInfo.privateKey;
    const privateKey = sdk_ts_1.PrivateKey.fromHex(privateKeyHash);
    const injectiveAddress = privateKey.toBech32();
    const signer = privateKey.toAddress();
    const pubKey = privateKey.toPublicKey().toBase64();
    console.log('swap');
    if (type == 'buy') {
        switch (value) {
            case 'buyS':
                amount = setInfo.buy1;
                break;
            case 'buyL':
                amount = setInfo.buy2;
                break;
            default:
                amount = Number(value);
        }
        if (amount > userData[chatId].balance)
            return { success: false, data: 'Insufficient balance' };
        const payAmount = Number(amount) * (1 - config_1.fee / 100) * Math.pow(10, 18);
        const slippageBps = (setInfo.slippage1 / 100).toString();
        let result;
        if (userInfo.referrer) {
            const ref = userData[userInfo.referrer].publicKey;
            const treasuryAmount = Math.floor(Number(amount) * (config_1.fee / 100) * Math.pow(10, 18) * 0.9);
            const refAmount = Math.floor(Number(amount) * (config_1.fee / 100) * Math.pow(10, 18) * 0.1);
            const refJSONMsg = {
                amount: {
                    denom: 'inj',
                    amount: refAmount.toString()
                },
                srcInjectiveAddress: injectiveAddress,
                dstInjectiveAddress: ref
            };
            const refMsg = sdk_ts_1.MsgSend.fromJSON(refJSONMsg);
            const feeJSONMsg = {
                amount: {
                    denom: 'inj',
                    amount: treasuryAmount.toString()
                },
                srcInjectiveAddress: injectiveAddress,
                dstInjectiveAddress: config_1.treasury
            };
            const feeMsg = sdk_ts_1.MsgSend.fromJSON(feeJSONMsg);
            const swapJSONMsg = {
                sender: signer.address,
                contractAddress: tokenAddr,
                funds: {
                    denom: "inj",
                    amount: payAmount.toString(),
                },
                msg: {
                    swap: {
                        offer_asset: {
                            info: {
                                native_token: {
                                    denom: "inj",
                                },
                            },
                            amount: payAmount.toString(),
                        },
                        max_spread: slippageBps,
                        to: signer.address,
                    },
                },
            };
            const swapMsg = sdk_ts_1.MsgExecuteContract.fromJSON(swapJSONMsg);
            await (0, utils_1.swap)(privateKey, injectiveAddress, pubKey, refMsg);
            await (0, utils_1.swap)(privateKey, injectiveAddress, pubKey, feeMsg);
            result = await (0, utils_1.swap)(privateKey, injectiveAddress, pubKey, swapMsg);
        }
        else {
            const treasuryAmount = Math.floor(Number(amount) * (config_1.fee / 100) * Math.pow(10, 18));
            const feeJSONMsg = {
                amount: {
                    denom: 'inj',
                    amount: treasuryAmount.toString()
                },
                srcInjectiveAddress: injectiveAddress,
                dstInjectiveAddress: config_1.treasury
            };
            const feeMsg = sdk_ts_1.MsgSend.fromJSON(feeJSONMsg);
            const swapJSONMsg = {
                sender: signer.address,
                contractAddress: tokenAddr,
                funds: {
                    denom: "inj",
                    amount: payAmount.toString(),
                },
                msg: {
                    swap: {
                        offer_asset: {
                            info: {
                                native_token: {
                                    denom: "inj",
                                },
                            },
                            amount: payAmount.toString(),
                        },
                        max_spread: slippageBps,
                        to: signer.address,
                    },
                },
            };
            const swapMsg = sdk_ts_1.MsgExecuteContract.fromJSON(swapJSONMsg);
            await (0, utils_1.swap)(privateKey, injectiveAddress, pubKey, feeMsg);
            result = await (0, utils_1.swap)(privateKey, injectiveAddress, pubKey, swapMsg);
        }
        if (result.success) {
            const currentBuy = isNaN(Number(userData[chatId].buy)) ? 0 : Number(userData[chatId].buy);
            userData[chatId].buy = currentBuy + payAmount;
            (0, utils_1.writeData)(userData, config_1.userPath);
            const currentRank = isNaN(Number(rankData[chatId])) ? 0 : Number(rankData[chatId]);
            rankData[chatId] = currentRank + payAmount;
            (0, utils_1.writeData)(rankData, config_1.rankPath);
        }
        return result;
    }
    else {
        switch (value) {
            case 'sellS':
                amount = setInfo.sell1;
                break;
            case 'sellL':
                amount = setInfo.sell2;
                break;
            default:
                amount = Number(value);
        }
        const tokenList = await indexerRestExplorerApi.fetchCW20BalancesNoThrow(injectiveAddress);
        const tokenInfo = tokenList.filter(item => item.contractAddress == tokenAddr);
        const totalAmount = Number(tokenInfo[0].balance) * amount / 100;
        const payAmount = totalAmount * (1 - config_1.fee / 100);
        const slippageBps = (setInfo.slippage2 / 100).toString();
        const { pairAddress } = (await (0, exports.getTokenInfoHelper)(tokenAddr, chatId));
        const originINJBalance = await getINJBalance(userInfo.publicKey);
        let result;
        if (userInfo.referrer) {
            const ref = userData[userInfo.referrer].publicKey;
            const treasuryAmount = totalAmount * config_1.fee / 100 * 0.9;
            const refAmount = totalAmount * config_1.fee / 100 * 0.1;
            const refJSONMsg = {
                contractAddress: tokenAddr,
                sender: injectiveAddress,
                exec: {
                    action: "transfer",
                    msg: {
                        recipient: ref,
                        amount: refAmount.toString(),
                    },
                },
            };
            const refMsg = sdk_ts_1.MsgExecuteContract.fromJSON(refJSONMsg);
            const feeJSONMsg = {
                contractAddress: tokenAddr,
                sender: injectiveAddress,
                exec: {
                    action: "transfer",
                    msg: {
                        recipient: config_1.treasury,
                        amount: treasuryAmount.toString(),
                    },
                },
            };
            const feeMsg = sdk_ts_1.MsgExecuteContract.fromJSON(feeJSONMsg);
            const swapJSONMsg = {
                sender: signer.address,
                contractAddress: tokenAddr,
                msg: {
                    send: {
                        contract: pairAddress,
                        amount: payAmount.toString(),
                        msg: (0, sdk_ts_1.toBase64)({
                            swap: { max_spread: slippageBps },
                        }),
                    },
                },
            };
            const swapMsg = sdk_ts_1.MsgExecuteContract.fromJSON(swapJSONMsg);
            await (0, utils_1.swap)(privateKey, injectiveAddress, pubKey, refMsg);
            await (0, utils_1.swap)(privateKey, injectiveAddress, pubKey, feeMsg);
            result = await (0, utils_1.swap)(privateKey, injectiveAddress, pubKey, swapMsg);
        }
        else {
            const treasuryAmount = totalAmount * config_1.fee / 100;
            const feeJSONMsg = {
                contractAddress: tokenAddr,
                sender: injectiveAddress,
                exec: {
                    action: "transfer",
                    msg: {
                        recipient: config_1.treasury,
                        amount: treasuryAmount.toString(),
                    },
                },
            };
            const feeMsg = sdk_ts_1.MsgExecuteContract.fromJSON(feeJSONMsg);
            const swapJSONMsg = {
                sender: signer.address,
                contractAddress: tokenAddr,
                msg: {
                    send: {
                        contract: pairAddress,
                        amount: payAmount.toString(),
                        msg: (0, sdk_ts_1.toBase64)({
                            swap: { max_spread: slippageBps },
                        }),
                    },
                },
            };
            const swapMsg = sdk_ts_1.MsgExecuteContract.fromJSON(swapJSONMsg);
            await (0, utils_1.swap)(privateKey, injectiveAddress, pubKey, feeMsg);
            result = await (0, utils_1.swap)(privateKey, injectiveAddress, pubKey, swapMsg);
        }
        if (result.success) {
            const currentINJBalance = await getINJBalance(userInfo.publicKey);
            const tradedAmount = (currentINJBalance - originINJBalance) * Math.pow(10, 18);
            const currentSell = isNaN(Number(userData[chatId].sell)) ? 0 : Number(userData[chatId].sell);
            userData[chatId].sell = currentSell + tradedAmount;
            (0, utils_1.writeData)(userData, config_1.userPath);
            const currentRank = isNaN(Number(rankData[chatId])) ? 0 : Number(rankData[chatId]);
            rankData[chatId] = currentRank + tradedAmount;
            (0, utils_1.writeData)(rankData, config_1.rankPath);
        }
        return result;
    }
};
exports.swapTokenHelper = swapTokenHelper;
const getTopTradersHelper = async () => {
    rankData = await (0, utils_1.readData)(config_1.rankPath);
    const sortedData = Object.entries(rankData).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const content = [];
    sortedData.map((item) => {
        const address = userData[item[0]].publicKey;
        const shorAddress = address.slice(0, 8) + ' ... ' + address.slice(-5);
        const volume = (item[1] / Math.pow(10, 18)).toFixed(6);
        content.push([{ text: `${shorAddress} : ${volume} INJ`, url: `${config_1.injExplorer}/account/${userData[item[0]].publicKey}` }]);
    });
    content.push([{ text: `Close`, callback_data: `cancel` }]);
    return content;
};
exports.getTopTradersHelper = getTopTradersHelper;
const getAllTokenList = async (chatId) => {
    const address = userData[chatId].publicKey;
    const tokenList = await indexerRestExplorerApi.fetchCW20BalancesNoThrow(address);
    return tokenList;
};
exports.getAllTokenList = getAllTokenList;
const addPlaceOrder = async (chatId, price, amount, address, type) => {
    try {
        orderData[chatId] = [{
                privateKey: userData[chatId].privateKey,
                publicKey: userData[chatId].publicKey,
                amount,
                price,
                address,
                type
            }];
        (0, utils_1.writeData)(orderData, config_1.orderPath);
        return true;
    }
    catch (e) {
        console.warn(e);
        return false;
    }
};
exports.addPlaceOrder = addPlaceOrder;
const placeLimitOrder = async () => {
    setInterval(async () => {
        orderData = await (0, utils_1.readData)(config_1.orderPath);
        for (const key in orderData) {
            if (Object.prototype.hasOwnProperty.call(orderData, key)) {
                for (let i = 0; i < orderData[key].length; i++) {
                    const data = await (0, exports.checkPossibleOrder)(orderData[key][i]);
                    if ((data === null || data === void 0 ? void 0 : data.status) == 0) {
                        orderData[key].splice(i, 1);
                        i--;
                        (0, utils_1.writeData)(orderData, config_1.orderPath);
                        continue;
                    }
                    else if ((data === null || data === void 0 ? void 0 : data.status) == 2) {
                        const res = await orderBuy(orderData[key][i], key, data.pairAddress);
                        if (res) {
                            orderData[key].splice(i, 1);
                            (0, utils_1.writeData)(orderData, config_1.orderPath);
                            // bot.sendMessage(key, `Order ${i + 1} placed successfully`)
                            i--;
                            continue;
                        }
                    }
                }
            }
        }
    }, 600000);
};
exports.placeLimitOrder = placeLimitOrder;
const orderBuy = async (data, chatId, tokenAddr) => {
    userData = await (0, utils_1.readData)(config_1.userPath);
    settings = await (0, utils_1.readData)(config_1.settingsPath);
    const userInfo = userData[chatId];
    const privateKeyHash = userInfo.privateKey;
    const privateKey = sdk_ts_1.PrivateKey.fromHex(privateKeyHash);
    const injectiveAddress = privateKey.toBech32();
    const signer = privateKey.toAddress();
    const pubKey = privateKey.toPublicKey().toBase64();
    const setInfo = settings[chatId];
    const { amount, address } = data;
    if (amount > userData[chatId].balance)
        return false;
    const payAmount = Number(amount) * (1 - config_1.fee / 100) * Math.pow(10, 18);
    const slippageBps = (setInfo.slippage1 / 100).toString();
    let result;
    if (userInfo.referrer) {
        const ref = userData[userInfo.referrer].publicKey;
        const treasuryAmount = Math.floor(Number(amount) * (config_1.fee / 100) * Math.pow(10, 18) * 0.9);
        const refAmount = Math.floor(Number(amount) * (config_1.fee / 100) * Math.pow(10, 18) * 0.1);
        const refJSONMsg = {
            amount: {
                denom: 'inj',
                amount: refAmount.toString()
            },
            srcInjectiveAddress: injectiveAddress,
            dstInjectiveAddress: ref
        };
        const refMsg = sdk_ts_1.MsgSend.fromJSON(refJSONMsg);
        const feeJSONMsg = {
            amount: {
                denom: 'inj',
                amount: treasuryAmount.toString()
            },
            srcInjectiveAddress: injectiveAddress,
            dstInjectiveAddress: config_1.treasury
        };
        const feeMsg = sdk_ts_1.MsgSend.fromJSON(feeJSONMsg);
        const swapJSONMsg = {
            sender: signer.address,
            contractAddress: tokenAddr,
            funds: {
                denom: "inj",
                amount: payAmount.toString(),
            },
            msg: {
                swap: {
                    offer_asset: {
                        info: {
                            native_token: {
                                denom: "inj",
                            },
                        },
                        amount: payAmount.toString(),
                    },
                    max_spread: slippageBps,
                    to: signer.address,
                },
            },
        };
        const swapMsg = sdk_ts_1.MsgExecuteContract.fromJSON(swapJSONMsg);
        await (0, utils_1.swap)(privateKey, injectiveAddress, pubKey, refMsg);
        await (0, utils_1.swap)(privateKey, injectiveAddress, pubKey, feeMsg);
        result = await (0, utils_1.swap)(privateKey, injectiveAddress, pubKey, swapMsg);
    }
    else {
        const treasuryAmount = Math.floor(Number(amount) * (config_1.fee / 100) * Math.pow(10, 18));
        const feeJSONMsg = {
            amount: {
                denom: 'inj',
                amount: treasuryAmount.toString()
            },
            srcInjectiveAddress: injectiveAddress,
            dstInjectiveAddress: config_1.treasury
        };
        const feeMsg = sdk_ts_1.MsgSend.fromJSON(feeJSONMsg);
        const swapJSONMsg = {
            sender: signer.address,
            contractAddress: tokenAddr,
            funds: {
                denom: "inj",
                amount: payAmount.toString(),
            },
            msg: {
                swap: {
                    offer_asset: {
                        info: {
                            native_token: {
                                denom: "inj",
                            },
                        },
                        amount: payAmount.toString(),
                    },
                    max_spread: slippageBps,
                    to: signer.address,
                },
            },
        };
        const swapMsg = sdk_ts_1.MsgExecuteContract.fromJSON(swapJSONMsg);
        await (0, utils_1.swap)(privateKey, injectiveAddress, pubKey, feeMsg);
        result = await (0, utils_1.swap)(privateKey, injectiveAddress, pubKey, swapMsg);
    }
    if (result.success) {
        const currentBuy = isNaN(Number(userData[chatId].buy)) ? 0 : Number(userData[chatId].buy);
        userData[chatId].buy = currentBuy + payAmount;
        (0, utils_1.writeData)(userData, config_1.userPath);
        const currentRank = isNaN(Number(rankData[chatId])) ? 0 : Number(rankData[chatId]);
        rankData[chatId] = currentRank + payAmount;
        (0, utils_1.writeData)(rankData, config_1.rankPath);
    }
    return true;
};
const checkPossibleOrder = async (data) => {
    const address = data.address;
    const price = data.price;
    const type = data.type;
    if (type == "buy") {
        const dex = (await axios_1.default.get(`${config_1.dexUrl}/${address}`)).data;
        if (!('pairs' in dex))
            return { status: 0 }; // no pair
        const pairs = dex.pairs;
        for (let i = 0; i < pairs.length; i++) {
            if (pairs[i].chainId == 'injective' && pairs[i].dexId == 'dojoswap' && ((pairs[i].baseToken.address == config_1.injAddr && pairs[i].quoteToken.address == address) || (pairs[i].quoteToken.address == config_1.injAddr && pairs[i].baseToken.address == address))) {
                const currentPrice = pairs[i].priceUsd;
                if (currentPrice < price)
                    return { status: 2, pairAddress: pairs[i].pairAddress }; // possible
                else
                    return { status: 1 }; // impossible
            }
        }
    }
};
exports.checkPossibleOrder = checkPossibleOrder;
const getInjPriceFiat = async () => {
    const indexerGrpcOracleApi = new sdk_ts_1.IndexerGrpcOracleApi(endpoints.indexer);
    const oracleList = await indexerGrpcOracleApi.fetchOracleList();
    const injOracle = oracleList.find((list) => list.symbol === "INJ");
    return injOracle === null || injOracle === void 0 ? void 0 : injOracle.price;
};
const isValidAddress = (address) => {
    // Define the regular expression pattern for the address
    const regexPattern = /inj[a-z0-9]{39}/;
    // Test the address against the pattern
    return regexPattern.test(address);
};
exports.isValidAddress = isValidAddress;
const isValidPrivkey = (address) => {
    // Define the regular expression pattern for the address
    const regexPattern = /^0x[a-fA-F0-9]{40}$/;
    // Test the address against the pattern
    return regexPattern.test(address);
};
exports.isValidPrivkey = isValidPrivkey;
//# sourceMappingURL=helper.js.map