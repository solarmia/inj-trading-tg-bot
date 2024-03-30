"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaderBoard = exports.help = exports.invalid = exports.checkINJBalance = exports.swapTokens = exports.getTokenInfo = exports.newSettings = exports.settings = exports.refer = exports.showKey = exports.confirm = exports.wallet = exports.sell = exports.inputSellAmount = exports.inputBuyAmount = exports.buy = exports.createWallet = exports.refreshWallet = exports.refresh = exports.importWallet = exports.welcome = exports.addreferral = exports.referralCheck = exports.commandList = void 0;
const config_1 = require("../config");
const type_1 = require("../utils/type");
const helper_1 = require("./helper");
const confirmList = {
    exportKey: {
        title: "Are you sure you want to export your Private Key?",
        content: [
            [{ text: `Confirm`, callback_data: `show` }, { text: `Cancel`, callback_data: `cancel` }]
        ]
    },
    resetWallet: {
        title: "Are you sure you want to reset your wallet?",
        content: [
            [{ text: `Import you own Wallet`, callback_data: `import` }, { text: `Create new Wallet`, callback_data: `create` }], [{ text: `Cancel`, callback_data: `cancel` }]
        ]
    },
};
exports.commandList = [
    { command: 'start', description: 'Start the bot' },
    { command: 'buy', description: 'Buy tokens' },
    { command: 'sell', description: 'Sell your token' },
    { command: 'wallet', description: 'View wallet info' },
    { command: 'leaderboard', description: 'Show 5 top traders ranking' },
    { command: 'settings', description: 'Show the settings menu' },
    { command: 'referral', description: 'Refer your friend' },
    { command: 'help', description: 'Tips and faqs' }
];
const mainContent = (pin = false) => [
    [{ text: `Buy`, callback_data: 'buy' }, { text: `Sell`, callback_data: 'sell' }],
    [{ text: `Wallet`, callback_data: 'wallet' }, { text: `Settings`, callback_data: 'settings' }],
    [{ text: `Refer Friend`, callback_data: 'refer' }, { text: `Help`, callback_data: 'help' }],
    [{ text: `Refresh`, callback_data: 'refresh' }, { text: `Leader Board`, callback_data: 'leaderboard' }],
    [{ text: `${pin ? 'Unpin' : 'Pin'}`, callback_data: `${pin ? 'unpin' : 'pin'}` }],
];
const referralCheck = async (chatId) => {
    if (!(await (0, helper_1.checkInfo)(chatId))) {
        const title = 'Did you receive a referral link?';
        const content = [[{ text: 'Yes', callback_data: "inputref" }, { text: 'No', callback_data: "welcome" }]];
        return { title, content };
    }
    return undefined;
};
exports.referralCheck = referralCheck;
const addreferral = async (chatId, referralLink, botName) => {
    const validation = await (0, helper_1.validReferalLink)(referralLink, botName, chatId);
    if (validation)
        return { data: 'Successfully added referral link', flag: true };
    return { data: 'Invalid referral link', content: [[{ text: 'Try again', callback_data: 'inputref' }, { text: 'Cancel', callback_data: 'cancel' }]], flag: false };
};
exports.addreferral = addreferral;
const welcome = async (chatId, botName, pin = false) => {
    if (await (0, helper_1.checkInfo)(chatId)) {
        const data = await (0, helper_1.fetch)(chatId, botName);
        if (!data)
            return undefined;
        const { publicKey, balance } = data;
        const title = `Welcome to Scale Bot
        
To get started with trading, send some INJ to your Scale Bot wallet address:
<code>${publicKey}</code>

INJ balance: ${balance} INJ

Once done tap refresh and your balance will appear here.

To buy a token just enter a token address.

For more info on your wallet and to retrieve your private key, tap the wallet button below. We guarantee the safety of user funds on ScaleXFi Bot, but if you expose your private key your funds will not be safe.`;
        const content = mainContent(pin);
        return {
            title, content
        };
    }
    else {
        const title = `Welcome to Scale Bot
    
Are you going to create new wallet or import your own wallet?`;
        const content = [
            [{ text: `Import`, callback_data: 'import' }, { text: `Create`, callback_data: 'create' }],
        ];
        return {
            title, content
        };
    }
};
exports.welcome = welcome;
const importWallet = async (chatId, privateKey, botName) => {
    const data = await (0, helper_1.importWalletHelper)(chatId, privateKey, botName);
    if (data) {
        const publicKey = data === null || data === void 0 ? void 0 : data.publicKey;
        const balance = data === null || data === void 0 ? void 0 : data.balance;
        const title = `Successfully imported!
    
To get started with trading, send some INJ to your Scale Bot wallet address:
<code>${publicKey}</code>

INJ balance: ${balance} INJ

Once done tap refresh and your balance will appear here.

To buy a token just enter a token address.

For more info on your wallet and to retrieve your private key, tap the wallet button below. We guarantee the safety of user funds on ScaleXFi Bot, but if you expose your private key your funds will not be safe.`;
        const content = mainContent();
        return {
            title, content
        };
    }
    return (0, exports.invalid)('invalidPrivKey');
};
exports.importWallet = importWallet;
const refresh = async (chatId) => {
    const data = await (0, helper_1.fetch)(chatId);
    if (data) {
        const { publicKey, balance, sclx } = data;
        const title = `Successfully refreshed!
        
To get started with trading, send some INJ to your Scale Bot wallet address:
<code>${publicKey}</code>

INJ balance: ${balance} INJ
SCLX amount: ${sclx} SCLX

Once done tap refresh and your balance will appear here.

To buy a token just enter a token address.

For more info on your wallet and to retrieve your private key, tap the wallet button below. We guarantee the safety of user funds on ScaleXFi Bot, but if you expose your private key your funds will not be safe.`;
        const content = mainContent();
        return {
            title, content
        };
    }
    else
        return register();
};
exports.refresh = refresh;
const refreshWallet = async (chatId) => {
    const data = await (0, helper_1.fetch)(chatId);
    if (data) {
        const { publicKey, balance, sclx } = data;
        const title = `Successfully refreshed!
    
Your Scale Bot wallet address:
<code>${publicKey}</code>

INJ balance: ${balance} INJ
SCLX amount: ${sclx} SCLX

Tap to copy the address and send INJ to deposit.`;
        const content = [
            [{ text: `View on explorer`, url: `https://explorer.injective.network/account/${publicKey}` }, { text: `Refresh`, callback_data: `refresh` }],
            // [{ text: `Withdraw all INJ`, callback_data: `withdraw` }, { text: `Withdraw X INJ`, callback_data: `withdrawX` }],
            [{ text: `Export Private Key`, callback_data: `export` }, { text: `Reset wallet`, callback_data: `reset` }],
            [{ text: `Close`, callback_data: `cancel` }]
        ];
        return {
            title, content
        };
    }
    else
        return register();
};
exports.refreshWallet = refreshWallet;
const createWallet = async (chatId, botName) => {
    const data = await (0, helper_1.createWalletHelper)(chatId, botName);
    if (data) {
        const { publicKey, balance } = data;
        const title = `Successfully Created!
    
To get started with trading, send some INJ to your Scale Bot wallet address:
<code>${publicKey}</code>

INJ balance: ${balance} INJ

Once done tap refresh and your balance will appear here.

To buy a token just enter a token address.

For more info on your wallet and to retrieve your private key, tap the wallet button below. We guarantee the safety of user funds on ScaleXFi Bot, but if you expose your private key your funds will not be safe.`;
        const content = mainContent();
        return {
            title, content
        };
    }
};
exports.createWallet = createWallet;
const buy = async (chatId) => {
    if (await (0, helper_1.checkInfo)(chatId)) {
        const title = `Buy Token:
  
Input cw20 token address to buy. 

ex: inj123456789abc...`;
        const content = [
            [{ text: `Cancel`, callback_data: 'cancel' }]
        ];
        return {
            title, content
        };
    }
    else
        return register();
};
exports.buy = buy;
const register = () => {
    const title = `Please register your wallet first. Please click button to register.`;
    const content = [
        [{ text: `Register`, callback_data: 'register' }]
    ];
    return {
        title, content
    };
};
const inputBuyAmount = () => {
    const title = `Buy Token:
  
Input INJ amount to buy tokens in the scope of your balance.`;
    const content = [
        [{ text: `Cancel`, callback_data: 'cancel' }]
    ];
    return {
        title, content
    };
};
exports.inputBuyAmount = inputBuyAmount;
const inputSellAmount = () => {
    const title = `Sell Token:
  
Input token percentage to sell tokens.(1 ~ 100%)`;
    const content = [
        [{ text: `Cancel`, callback_data: 'cancel' }]
    ];
    return {
        title, content
    };
};
exports.inputSellAmount = inputSellAmount;
const sell = async (chatId) => {
    const data = await (0, helper_1.fetch)(chatId);
    if (data) {
        const ownTokens = await (0, helper_1.getAllTokenList)(chatId);
        if (ownTokens.length) {
            const title = `Token list you have in your wallet. Select token to sell.`;
            const content = [];
            ownTokens.map((val) => {
                content.push([{ text: `Token: ${val.token.symbol}   Balance: ${val.balance / Math.pow(10, val.token.decimals)}`, callback_data: `sell:${val.contractAddress}` }]);
            });
            content.push([{ text: `Close`, callback_data: `cancel` }]);
            return {
                title, content
            };
        }
        else {
            const title = `You have no tokens in your wallet.`;
            const content = [[{ text: `Close`, callback_data: `cancel` }]];
            return {
                title, content
            };
        }
    }
    else
        return register();
};
exports.sell = sell;
const wallet = async (chatId) => {
    const data = await (0, helper_1.fetch)(chatId);
    if (data) {
        const { publicKey, balance, sclx } = data;
        const title = `Your Wallet:
    
Your Scale Bot wallet address: <code>${publicKey}</code>
INJ Balance: ${balance} INJ
SCLX amount: ${sclx} SCLX

Tap to copy the address and send INJ to deposit.`;
        const content = [
            [{ text: `View on explorer`, url: `https://explorer.injective.network/account/${publicKey}` }, { text: `Refresh`, callback_data: `refreshwallet` }],
            // [{ text: `Withdraw all INJ`, callback_data: `withdraw` }, { text: `Withdraw X INJ`, callback_data: `withdrawX` }],
            [{ text: `Export Private Key`, callback_data: `export` }, { text: `Reset wallet`, callback_data: `reset` }],
            [{ text: `Close`, callback_data: `cancel` }]
        ];
        return {
            title, content
        };
    }
    else
        return register();
};
exports.wallet = wallet;
const confirm = async (status) => {
    const title = confirmList[status].title;
    const content = confirmList[status].content;
    return {
        title, content
    };
};
exports.confirm = confirm;
const showKey = async (chatId) => {
    const data = await (0, helper_1.fetch)(chatId);
    if (data) {
        const { privateKey } = data;
        const title = `Your Private Key is:

<code>${privateKey}</code>
    
Delete this message once you are done.`;
        const content = [
            [{ text: `Delete`, callback_data: `cancel` }]
        ];
        return {
            title, content
        };
    }
    else
        return register();
};
exports.showKey = showKey;
const refer = async (chatId) => {
    const data = await (0, helper_1.fetch)(chatId);
    if (data) {
        const { referralLink, referees, referrer } = data;
        const title = `Referral Link: 
<code>${referralLink}</code>

Referrals counts: ${referees.length}
You can get reward if you refer someone

${referrer ? "You have been referred" : ""}`;
        const content = [
            [{ text: `Close`, callback_data: `cancel` }]
        ];
        return {
            title, content
        };
    }
    else
        return register();
};
exports.refer = refer;
const settings = async (chatId) => {
    const title = `Settings

BUTTONS CONFIG
Customize your buy and sell buttons for buy token and manage position. Tap to edit.

SLIPPAGE CONFIG
Customize your slippage settings for buys and sells. Tap to edit.
Max Price Impact is to protect against trades in extremely illiquid pools.`;
    const { buy1, buy2, sell1, sell2, slippage1, slippage2, } = await (0, helper_1.getSetting)(chatId);
    const content = [
        [{ text: `--- Buy Amount Config ---`, callback_data: `buy config` }],
        [{ text: `✎ Left: ${buy1} INJ`, callback_data: `buy1` }, {
                text: `✎ Right: ${buy2} INJ`, callback_data: `buy2`
            }],
        [{ text: `--- Sell Amount Config ---`, callback_data: `sell config` }],
        [{ text: `✎ Left: ${sell1} %`, callback_data: `sell1` }, {
                text: `✎ Right: ${sell2} %`, callback_data: `sell2`
            }],
        [{ text: `--- Slippage Percentage Config ---`, callback_data: `slippage config` }],
        [{ text: `✎ Buy: ${slippage1} %`, callback_data: `slippage1` }, {
                text: `✎ Sell: ${slippage2} %`, callback_data: `slippage2`
            }],
        [{ text: `Close`, callback_data: `cancel` }]
    ];
    return { title, content };
};
exports.settings = settings;
const newSettings = async (chatId, category, value) => {
    const title = `Settings

BUTTONS AMOUNT CONFIG
Customize your buy buttons for buy token amount and manage position. Tap to edit.

SELL PERCENTAGE CONFIG
Customize your sell buttons for sell token percentage and manage position. Tap to edit.

SLIPPAGE CONFIG
Customize your slippage settings for buys and sells. Tap to edit.
Max Price Impact is to protect against trades in extremely illiquid pools.`;
    const { announcement, buy1, buy2, sell1, sell2, slippage1, slippage2, priority, priorityAmount } = await (0, helper_1.setSettings)(chatId, category, value);
    const content = [
        [{ text: `--- Buy Amount Config ---`, callback_data: `buy config` }],
        [{ text: `✎ Left: ${buy1} INJ`, callback_data: `buy1` }, {
                text: `✎ Right: ${buy2} INJ`, callback_data: `buy2`
            }],
        [{ text: `--- Sell Percentage Config ---`, callback_data: `sell config` }],
        [{ text: `✎ Left: ${sell1} %`, callback_data: `sell1` }, {
                text: `✎ Right: ${sell2} %`, callback_data: `sell2`
            }],
        [{ text: `--- Slippage Percentage Config ---`, callback_data: `slippage config` }],
        [{ text: `✎ Buy: ${slippage1} %`, callback_data: `slippage1` }, {
                text: `✎ Sell: ${slippage2} %`, callback_data: `slippage2`
            }],
        [{ text: `Close`, callback_data: `cancel` }]
    ];
    return { title, content };
};
exports.newSettings = newSettings;
const getTokenInfo = async (chatId, address, method) => {
    try {
        const flag = (0, helper_1.isValidAddress)(address);
        if (flag) {
            const result = await (0, helper_1.getTokenInfoHelper)(address, chatId);
            if (result) {
                if (method == 'buy') {
                    const title = `${result.tokenInfo.name} | ${result.tokenInfo.symbol} | <code>${address}</code>

Price: $${result.price}
5m: ${result.priceChange.m5}%, 1h: ${result.priceChange.h1}%, 6h: ${result.priceChange.h6}%, 24h: ${result.priceChange.h24}%
Market Cap: $${result.fdv}

Wallet Balance: ${result.balance} INJ
To buy press one of the buttons below.`;
                    const { buy1, buy2 } = await (0, helper_1.getSetting)(chatId);
                    const content = [
                        [{ text: `Token Explorer`, url: `${config_1.injExplorer}/account/${address}` }, { text: `Pair Explorer`, url: `${config_1.dojoPairUrl}/${result.pairAddress}` }],
                        [{ text: `Buy ${buy1} INJ`, callback_data: `buyS:${result.pairAddress}` }, {
                                text: `Buy ${buy2} INJ`, callback_data: `buyL:${result.pairAddress}`
                            }, { text: `Buy X INJ`, callback_data: `buyX:${result.pairAddress}` }],
                        [{ text: `Limit Order`, callback_data: `limitB:${address}` }],
                        [{ text: `Close`, callback_data: `cancel` }]
                    ];
                    return { title, content };
                }
                else {
                    const title = `${result.tokenInfo.name} | ${result.tokenInfo.symbol} | <code>${address}</code>

Price: $${result.price}
5m: ${result.priceChange.m5}%, 1h: ${result.priceChange.h1}%, 6h: ${result.priceChange.h6}%, 24h: ${result.priceChange.h24}%
Market Cap: $${result.fdv}

Wallet Balance: ${result.balance} INJ
To sell press one of the buttons below.`;
                    const { sell1, sell2 } = await (0, helper_1.getSetting)(chatId);
                    const content = [
                        [{ text: `Token Explorer`, url: `${config_1.injExplorer}/account/${address}` }, { text: `Pair Explorer`, url: `${config_1.dojoPairUrl}/${result.pairAddress}` }],
                        [{ text: `Sell ${sell1} %`, callback_data: `sellS:${address}` }, {
                                text: `Sell ${sell2} %`, callback_data: `sellL:${address}`
                            }, { text: `Sell X %`, callback_data: `sellX:${address}` }],
                        [{ text: `Close`, callback_data: `cancel` }]
                    ];
                    return { title, content };
                }
            }
            else
                return { title: type_1.errorTitle.inputBuyTokenAddress, content: [[{ text: 'Close', callback_data: 'cancel' }]] };
        }
        else
            return { title: type_1.errorTitle.inputBuyTokenAddress, content: [[{ text: 'Close', callback_data: 'cancel' }]] };
    }
    catch (e) {
        console.log(e);
        return undefined;
    }
};
exports.getTokenInfo = getTokenInfo;
const swapTokens = async (chatId, value, address, type) => {
    const result = await (0, helper_1.swapTokenHelper)(chatId, value, address, type);
    if (result && (result === null || result === void 0 ? void 0 : result.success)) {
        const title = `Transaction Sucesss `;
        const content = [[{ text: `View on explorer`, url: `https://explorer.injective.network/transaction/${result.data}/` }]];
        return { title, content };
    }
    else {
        const title = `Transaction Failed\n${result === null || result === void 0 ? void 0 : result.data}`;
        const content = [[{ text: `Close`, callback_data: `cancel` }]];
        return { title, content };
    }
};
exports.swapTokens = swapTokens;
const checkINJBalance = async (chatId, value) => {
    const data = await (0, helper_1.fetch)(chatId);
    const balance = data && (data === null || data === void 0 ? void 0 : data.balance) ? data === null || data === void 0 ? void 0 : data.balance : 0;
    return (balance < Number(value));
};
exports.checkINJBalance = checkINJBalance;
const invalid = (type) => {
    const title = type_1.errorTitle[type];
    const content = [[{ text: `Close`, callback_data: `cancel` }]];
    return { title, content };
};
exports.invalid = invalid;
const help = () => {
    const title = `Which tokens can I trade?

Any CW20 token that is a INJ pair on Dojoswap . We pick up pairs instantly, and swap token in 1 only min.

How can I see how much money I've made from referrals?

Check the referrals button or type /referral to see your payment in Scale world !

How can I create a new wallet on Scale Bot?

Click the Wallet button or type /wallet, and you will be able to configure your new wallets

Can I import my previously created Injective wallet?

Yes, you can import your any Injective wallet which you have created previously.

Is Scale Bot free? How much do i pay for transactions?

Scale Bot is absolutely free! will be always. We charge only 1% on transactions, and keep the bot free so that everyone can use it.

How does Scale Bot gurantee transaction success rate?

Scale Bot provides best service for transaction.
You can set this amount in settings button or /settings.

Why is  Profit Lower Than Expectation?
Your Net Profit is calculated after deducting all associated costs, including Price Impact, Transfer Tax, Dex Fees, and a 1% Scale Bot fee. This ensures the figure you see is what you actually receive, accounting for all transaction-related expenses.

Is there a difference between <a href="https://t.me/scaleXFibot">@Scale Bot</a> and other bots?
Yes, Scale bot is way faster than any other trading bots built on Injective ecosystem and comes with lots of new features like:
- Refer to earn
- Weekly leaderboard
- Rewards for top traders
- Wallet import`;
    const content = [[{ text: 'close', callback_data: 'cancel' }]];
    return { title, content };
};
exports.help = help;
const leaderBoard = async () => {
    const title = `Top trader ranking`;
    const content = await (0, helper_1.getTopTradersHelper)();
    return { title, content };
};
exports.leaderBoard = leaderBoard;
//# sourceMappingURL=index.js.map