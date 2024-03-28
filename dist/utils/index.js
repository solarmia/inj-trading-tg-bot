"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swap = exports.getTokenDecimal = exports.tokenInfo = exports.writeData = exports.readData = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("../config");
const ts_types_1 = require("@injectivelabs/ts-types");
const networks_1 = require("@injectivelabs/networks");
const sdk_ts_1 = require("@injectivelabs/sdk-ts");
const utils_1 = require("@injectivelabs/utils");
const chainId = ts_types_1.ChainId.Mainnet; /* ChainId.Mainnet */
const restEndpoint = (0, networks_1.getNetworkEndpoints)(networks_1.Network.Mainnet).rest;
const chainRestAuthApi = new sdk_ts_1.ChainRestAuthApi(restEndpoint);
const chainRestTendermintApi = new sdk_ts_1.ChainRestTendermintApi(restEndpoint);
const readData = async (Path) => {
    return JSON.parse(fs_1.default.readFileSync(Path, `utf8`));
};
exports.readData = readData;
const writeData = async (data, path) => {
    const dataJson = JSON.stringify(data, null, 4);
    fs_1.default.writeFile(path, dataJson, (err) => {
        if (err) {
            console.log('Error writing file:', err);
        }
        else {
            console.log(`wrote file ${path}`);
        }
    });
};
exports.writeData = writeData;
const tokenInfo = async (addr) => {
    const dex = (await axios_1.default.get(`${config_1.dexUrl}/${addr}`)).data;
    if (!('pairs' in dex))
        return undefined;
    const pairs = dex.pairs;
    for (let i = 0; i < pairs.length; i++) {
        if (pairs[i].chainId == 'solana' && pairs[i].dexId == 'raydium' && ((pairs[i].baseToken.address == config_1.injAddr && pairs[i].quoteToken.address == addr) && (pairs[i].quoteToken.address == config_1.injAddr && pairs[i].baseToken.address == addr))) {
            return pairs[i];
        }
    }
    return pairs[0];
};
exports.tokenInfo = tokenInfo;
const getTokenDecimal = async (addr) => {
};
exports.getTokenDecimal = getTokenDecimal;
const swap = async (privateKey, injectiveAddress, pubKey, swapMsg) => {
    try {
        const accountDetailsResponse = await chainRestAuthApi.fetchAccount(injectiveAddress);
        const baseAccount = sdk_ts_1.BaseAccount.fromRestApi(accountDetailsResponse);
        const latestBlock = await chainRestTendermintApi.fetchLatestBlock();
        const latestHeight = latestBlock.header.height;
        const timeoutHeight = new utils_1.BigNumberInBase(latestHeight).plus(utils_1.DEFAULT_BLOCK_TIMEOUT_HEIGHT);
        const { txRaw, signBytes } = (0, sdk_ts_1.createTransaction)({
            pubKey,
            chainId,
            fee: Object.assign({}, utils_1.DEFAULT_STD_FEE),
            message: swapMsg,
            sequence: baseAccount.sequence,
            timeoutHeight: timeoutHeight.toNumber(),
            accountNumber: baseAccount.accountNumber,
        });
        const signature = await privateKey.sign(Buffer.from(signBytes));
        // console.log("signature -> \n", signature);
        const network = (0, networks_1.getNetworkInfo)(networks_1.Network.Mainnet);
        txRaw.signatures = [signature];
        /** Calculate hash of the transaction */
        // console.log(`txRaw: ${JSON.stringify(txRaw)}`);
        // console.log(`Transaction Hash: ${TxClient.hash(txRaw)}`);
        const txService = new sdk_ts_1.TxGrpcClient(network.grpc);
        // console.log(`txService: ${txService}`);
        /** Simulate transaction */
        const simulationResponse = await txService.simulate(txRaw);
        // console.log(`Transaction simulation response: ${JSON.stringify(simulationResponse.gasInfo)}`);
        /** Broadcast transaction */
        const txResponse = await txService.broadcast(txRaw);
        // console.log(txResponse);
        if (txResponse.code !== 0) {
            console.error(`Transaction failed: ${txResponse.rawLog}`);
            return { success: false, data: txResponse.rawLog };
        }
        else {
            console.log(`Broadcasted transaction hash: ${JSON.stringify(txResponse.txHash)}`);
            return { success: true, data: txResponse.txHash };
        }
    }
    catch (e) {
        console.log(e);
        return { success: false, data: e };
    }
};
exports.swap = swap;
//# sourceMappingURL=index.js.map